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
import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SequentialInferenceRuntime, StreamingInferenceRuntime } from "@domain/generative-model/runtime"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import OpenAI from "openai"

/**
 * Optional connection config. When omitted, the `openai` SDK reads
 * `OPENAI_API_KEY` and `OPENAI_BASE_URL` from the environment, so the
 * default-constructed runtime targets whatever `OPENAI_BASE_URL` points
 * at (real OpenAI when unset). Provider presets (e.g. DeepSeek) pass an
 * explicit base URL + credential.
 */
export interface OpenAICompatibleConfig {
	baseURL?: string
	apiKey?: string
	/**
	 * Extra request-body fields merged into every `chat.completions`
	 * call. This is how provider-specific quirks are handled **without
	 * a per-provider subclass in mozaik** — the consumer supplies the
	 * vendor-only fields (e.g. DeepSeek's `{ thinking: { type } }`,
	 * safety flags, routing hints). Standard fields the runtime already
	 * sets (`model`, `messages`, `tools`, `reasoning_effort`) take
	 * precedence and are not overwritten.
	 */
	extraBody?: Record<string, unknown>
}

/**
 * Generic adapter for any **OpenAI Chat Completions**-compatible
 * endpoint — real OpenAI, DeepSeek, Xiaomi MiMo, OpenRouter, vLLM,
 * Ollama, etc. It speaks `/chat/completions` (not the Responses API),
 * which is the dialect third-party OpenAI-compatible providers expose.
 *
 * The base URL and credential are configurable; everything else (the
 * `ModelContext` ⇄ chat-message conversion, tool-call round-trip, token
 * usage extraction) is provider-agnostic. Provider-specific request
 * shaping (e.g. DeepSeek's `thinking` field) is supplied by the
 * consumer via {@link OpenAICompatibleConfig.extraBody} — mozaik stays
 * generic and gains no per-provider subclasses.
 *
 * Was `DeepSeekChatCompletions`; generalized so consumers can point it
 * at any OpenAI-compatible endpoint.
 */
export class OpenAIChatCompletions implements SequentialInferenceRuntime, StreamingInferenceRuntime {
	private readonly client: OpenAI
	private readonly extraBody: Record<string, unknown>

	constructor(config: OpenAICompatibleConfig = {}) {
		// Passing `undefined` for baseURL/apiKey lets the SDK fall back
		// to OPENAI_BASE_URL / OPENAI_API_KEY from the environment.
		this.client = new OpenAI({
			baseURL: config.baseURL,
			apiKey: config.apiKey,
		})
		this.extraBody = config.extraBody ?? {}
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResponse> {
		const response = await this.client.chat.completions.create(this.buildRequest(inferenceRequest))

		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
	}

	async *stream(
		inferenceRequest: InferenceRequest,
		signal?: AbortSignal,
	): AsyncIterable<SemanticEvent<unknown>> {
		const stream: any = await this.client.chat.completions.create({
			...this.buildRequest(inferenceRequest),
			stream: true,
		})

		for await (const event of stream) {
			if (signal?.aborted) {
				break
			}
			yield new SemanticEvent(event.object ?? "chat.completion.chunk", event)
		}
	}

	buildRequest(inferenceRequest: InferenceRequest): any {
		const specification = inferenceRequest.model.specification

		// Consumer-supplied vendor quirks first, so the standard fields
		// below win on key collisions.
		const request: any = {
			...this.extraBody,
			model: specification.name,
			messages: this.mapContextToRequest(inferenceRequest.context),
		}

		if (specification.supportFunctionCalling && inferenceRequest.model.getTools().length > 0) {
			request.tools = inferenceRequest.model.getTools().map((tool) => {
				return {
					type: "function",
					function: {
						name: tool.name,
						description: tool.description,
						parameters: tool.parameters,
					},
				}
			})
		}

		// `reasoning_effort` is a standard OpenAI Chat Completions field;
		// emit it when the model declares reasoning support. Anything
		// non-standard (e.g. DeepSeek's `thinking` wrapper) is the
		// consumer's job via `extraBody`.
		if (specification.supportReasoningEffort) {
			request.reasoning_effort = inferenceRequest.model.getReasoningEffort()
		}

		return request
	}

	extractTokenUsage(response: any): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		return new TokenUsage(
			response.usage.prompt_tokens,
			response.usage.completion_tokens,
			response.usage.total_tokens,
			new InputTokenDetails(response.usage.prompt_tokens_details?.cached_tokens ?? 0),
			new OutputTokenDetails(response.usage.completion_tokens_details?.reasoning_tokens ?? 0),
		)
	}

	mapContextToRequest(context: ModelContext): any[] {
		const messages: any[] = []

		for (const item of context.getItems()) {
			if (item instanceof DeveloperMessageItem || item instanceof SystemMessageItem) {
				messages.push({ role: "system", content: item.content.text })
				continue
			}

			if (item instanceof UserMessageItem) {
				messages.push({ role: "user", content: item.content.text })
				continue
			}

			if (item instanceof ModelMessageItem) {
				messages.push({ role: "assistant", content: item.content.text })
				continue
			}

			if (item instanceof FunctionCallItem) {
				const toolCall = {
					id: item.callId,
					type: "function",
					function: { name: item.name, arguments: item.args },
				}
				const last = messages[messages.length - 1]
				if (last?.role === "assistant") {
					last.tool_calls = last.tool_calls ?? []
					last.tool_calls.push(toolCall)
				} else {
					messages.push({ role: "assistant", content: null, tool_calls: [toolCall] })
				}
				continue
			}

			if (item instanceof FunctionCallOutputItem) {
				messages.push({ role: "tool", tool_call_id: item.callId, content: item.output.text })
			}
		}

		return messages
	}

	extractContextItems(response: any): ContextItem[] {
		const items: ContextItem[] = []
		const message = response.choices?.[0]?.message
		if (!message) {
			return items
		}

		if (message.reasoning_content) {
			items.push(
				ReasoningItem.rehydrate({
					content: InputText.rehydrate({ text: message.reasoning_content }),
					encryptedContent: undefined,
					summary: [],
				}),
			)
		}

		if (message.content) {
			items.push(ModelMessageItem.rehydrate({ text: message.content }))
		}

		for (const toolCall of message.tool_calls ?? []) {
			items.push(
				FunctionCallItem.rehydrate({
					callId: toolCall.id,
					name: toolCall.function.name,
					args: toolCall.function.arguments,
				}),
			)
		}

		return items
	}
}
