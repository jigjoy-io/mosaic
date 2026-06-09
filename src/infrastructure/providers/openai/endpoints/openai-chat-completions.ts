import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Endpoint } from "@domain/generative-model/endpoint"
import { OpenAIChatCompletionsMapper } from "./openai-chat-completions-mapper"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName } from "@domain/generative-model/generative-model"
import OpenAI from "openai"
import { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

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
export class OpenAIChatCompletions implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private readonly client: OpenAI
	private readonly extraBody: Record<string, unknown>

	constructor(
		endpointMapper: InferenceEndpointMapper = new OpenAIChatCompletionsMapper(),
		config: OpenAICompatibleConfig = {},
	) {
		this.endpointMapper = endpointMapper
		// Passing `undefined` for baseURL/apiKey lets the SDK fall back
		// to OPENAI_BASE_URL / OPENAI_API_KEY from the environment.
		this.client = new OpenAI({
			baseURL: config.baseURL,
			apiKey: config.apiKey,
		})
		this.extraBody = config.extraBody ?? {}
	}

	private buildRequest(inferenceParams: InferenceParams<ModelName>): any {
		return {
			...this.extraBody,
			...this.endpointMapper.toRequest(inferenceParams),
		}
	}

	async infer(inferenceParams: InferenceParams<ModelName>): Promise<InferenceResponse> {
		const response = await this.client.chat.completions.create(this.buildRequest(inferenceParams))

		return this.endpointMapper.toResponse(response)
	}

	async *stream(
		inferenceParams: InferenceParams<ModelName>,
		signal?: AbortSignal,
	): AsyncIterable<SemanticEvent<unknown>> {
		const stream: any = await this.client.chat.completions.create(this.buildRequest(inferenceParams))

		for await (const event of stream) {
			if (signal?.aborted) {
				break
			}
			yield new SemanticEvent(event.object ?? "chat.completion.chunk", event)
		}
	}
}
