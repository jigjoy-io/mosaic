import { ContextItem } from "@domain/model-context/context-item/context-item"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import { GoogleGenAI } from "@google/genai"
import { Endpoint } from "@domain/generative-model/endpoint"

/**
 * Native Gemini adapter on the `@google/genai` SDK (`generateContent` /
 * `generateContentStream`). Unlike an OpenAI-compat shim this maps our
 * domain context to Gemini's native `contents`/`parts` shape, system
 * instruction, `functionDeclarations`, and `thinkingConfig`, and reads
 * thought parts + native usage metadata back out. Another `ModelRuntime`
 * — no runner or port changes.
 */
export class GeminiGenerateContent implements Endpoint {
	private readonly client: GoogleGenAI

	constructor() {
		this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
	}

	async infer(inferenceRequest: any): Promise<InferenceResponse> {
		const response = await this.client.models.generateContent(inferenceRequest)

		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
	}

	async *stream(
		inferenceRequest: any,
		signal?: AbortSignal,
	): AsyncIterable<SemanticEvent<unknown>> {
		const stream = await this.client.models.generateContentStream(inferenceRequest)

		for await (const chunk of stream) {
			if (signal?.aborted) {
				break
			}
			yield new SemanticEvent("generate_content_chunk", chunk)
		}
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


}
