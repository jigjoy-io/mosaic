import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { Endpoint } from "@domain/generative-model/endpoint"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import { AnthropicMessagesMapper } from "./anthropic-messages-mapper"
import Anthropic from "@anthropic-ai/sdk"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

export interface AnthropicConnectionConfig {
	baseURL?: string
	apiKey?: string
}

/**
 * Native Anthropic adapter on the `@anthropic-ai/sdk` (`messages.create`).
 * Maps domain context to Anthropic's `messages`/`content` blocks shape,
 * system prompt, tools, adaptive thinking, and structured output config.
 */
export class AnthropicMessages implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private readonly client: Anthropic

	constructor(
		endpointMapper: InferenceEndpointMapper = new AnthropicMessagesMapper(),
		config: AnthropicConnectionConfig = {},
	) {
		this.endpointMapper = endpointMapper
		this.client = new Anthropic({ baseURL: config.baseURL, apiKey: config.apiKey })
	}

	async infer(inferenceParams: InferenceParams): Promise<InferenceResponse> {
		const inferenceRequest = this.endpointMapper.toRequest(inferenceParams)
		const response = await this.client.messages.create(inferenceRequest)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceParams: InferenceParams): AsyncIterable<SemanticEvent> {
		const { signal } = inferenceParams
		const inferenceRequest = this.endpointMapper.toRequest(inferenceParams)
		const stream: any = await this.client.messages.create(inferenceRequest)

		for await (const event of stream) {
			if (signal?.aborted) {
				break
			}
			yield event
		}
	}
}
