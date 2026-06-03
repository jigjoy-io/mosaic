import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { InferenceRequest } from "@domain/generative-model/inference-request"
import { InferenceResponse } from "@domain/generative-model/inference-response"
import { ModelRuntime } from "@domain/generative-model/runtime/model-runtime"
import { StreamingRuntime } from "@domain/generative-model/runtime/streaming-runtime"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import { GoogleGenAI } from "@google/genai"

/**
 * Native Gemini adapter on the `@google/genai` SDK (`generateContent` /
 * `generateContentStream`). Unlike an OpenAI-compat shim this maps our
 * domain context to Gemini's native `contents`/`parts` shape, system
 * instruction, `functionDeclarations`, and `thinkingConfig`, and reads
 * thought parts + native usage metadata back out. Another `ModelRuntime`
 * — no runner or port changes.
 */
export class GeminiGenerateContent implements ModelRuntime, StreamingRuntime {
	private readonly client: GoogleGenAI

	constructor() {
		this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResponse> {
		const response = await this.client.models.generateContent(this.buildRequest(inferenceRequest))

		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
	}

	async *stream(
		inferenceRequest: InferenceRequest,
		signal?: AbortSignal,
	): AsyncIterable<ReasoningItem | FunctionCallItem | ModelMessageItem | SemanticEvent<unknown>> {
		const stream = await this.client.models.generateContentStream(this.buildRequest(inferenceRequest))

		for await (const chunk of stream) {
			if (signal?.aborted) {
				break
			}
			yield new SemanticEvent("generate_content_chunk", chunk)
		}
	}

	private buildRequest(inferenceRequest: InferenceRequest): any {
		const specification = inferenceRequest.model.specification
		const { contents, systemInstruction } = this.mapContextToRequest(inferenceRequest.context)

		const config: any = {}

		if (systemInstruction) {
			config.systemInstruction = systemInstruction
		}

		if (specification.supportFunctionCalling && inferenceRequest.model.getTools().length > 0) {
			config.tools = [
				{
					functionDeclarations: inferenceRequest.model.getTools().map((tool) => {
						return {
							name: tool.name,
							description: tool.description,
							parametersJsonSchema: tool.parameters,
						}
					}),
				},
			]
		}

		if (specification.supportReasoningEffort) {
			const effort = inferenceRequest.model.getReasoningEffort()
			// Gemini 3.x cannot fully disable thinking; "none" maps to the
			// lowest level.
			const thinkingLevel = effort === "none" ? "minimal" : effort
			config.thinkingConfig = { thinkingLevel, includeThoughts: true }
		}

		if (inferenceRequest.model.hasStructuredOutput()) {
			if (!specification.supportStructuredOutput) {
				throw new Error(`Structured output is not supported for model: ${specification.name}`)
			}
			const format = inferenceRequest.model.getStructuredOutput()!
			config.responseMimeType = "application/json"
			config.responseSchema = format.schema
		}

		return { model: specification.name, contents, config }
	}

	extractTokenUsage(response: any): TokenUsage | undefined {
		const usage = response.usageMetadata
		if (!usage) {
			return undefined
		}
		return new TokenUsage(
			usage.promptTokenCount ?? 0,
			usage.candidatesTokenCount ?? 0,
			usage.totalTokenCount ?? 0,
			new InputTokenDetails(usage.cachedContentTokenCount ?? 0),
			new OutputTokenDetails(usage.thoughtsTokenCount ?? 0),
		)
	}

	mapContextToRequest(context: ModelContext): { contents: any[]; systemInstruction?: string } {
		const contents: any[] = []
		const system: string[] = []
		const callNames = new Map<string, string>()

		for (const item of context.getItems()) {
			if (item instanceof DeveloperMessageItem || item instanceof SystemMessageItem) {
				system.push(item.content.text)
				continue
			}

			if (item instanceof UserMessageItem) {
				this.addPart(contents, "user", { text: item.content.text })
				continue
			}

			if (item instanceof ModelMessageItem) {
				this.addPart(contents, "model", { text: item.content.text })
				continue
			}

			if (item instanceof FunctionCallItem) {
				callNames.set(item.callId, item.name)
				let args: any
				try {
					args = JSON.parse(item.args)
				} catch {
					args = {}
				}
				this.addPart(contents, "model", { functionCall: { id: item.callId, name: item.name, args } })
				continue
			}

			if (item instanceof FunctionCallOutputItem) {
				this.addPart(contents, "user", {
					functionResponse: {
						id: item.callId,
						name: callNames.get(item.callId) ?? "",
						response: this.parseResponse(item.output.text),
					},
				})
			}
		}

		return {
			contents,
			systemInstruction: system.length > 0 ? system.join("\n\n") : undefined,
		}
	}

	extractContextItems(response: any): ContextItem[] {
		const items: ContextItem[] = []
		const parts = response.candidates?.[0]?.content?.parts ?? []

		for (const part of parts) {
			if (part.thought && part.text) {
				items.push(
					ReasoningItem.rehydrate({
						content: InputText.rehydrate({ text: part.text }),
						encryptedContent: undefined,
						summary: [],
					}),
				)
				continue
			}
			if (part.text) {
				items.push(ModelMessageItem.rehydrate({ text: part.text }))
				continue
			}
			if (part.functionCall) {
				items.push(
					FunctionCallItem.rehydrate({
						callId: part.functionCall.id ?? "",
						name: part.functionCall.name,
						args: JSON.stringify(part.functionCall.args ?? {}),
					}),
				)
			}
		}

		return items
	}

	private parseResponse(output: string): any {
		try {
			const parsed = JSON.parse(output)
			return parsed && typeof parsed === "object" ? parsed : { output }
		} catch {
			return { output }
		}
	}

	private addPart(contents: any[], role: "user" | "model", part: any): void {
		const last = contents[contents.length - 1]
		if (last?.role === role) {
			last.parts.push(part)
			return
		}

		contents.push({ role, parts: [part] })
	}
}
