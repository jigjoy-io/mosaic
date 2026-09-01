import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { Endpoint } from "@domain/generative-model/endpoint"
import type { InferenceInput, InferenceOutput } from "@app/states/inference"
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

	async infer(inferenceInput: InferenceInput): Promise<InferenceOutput> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const response = await this.client.messages.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceInput: InferenceInput): AsyncIterable<SemanticEvent> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const stream = this.client.messages.stream(request)

		for await (const event of stream) {
			yield event as unknown as SemanticEvent
		}

		const output = this.endpointMapper.toResponse(await stream.finalMessage())

		yield {
			type: "inference.output",
			producerId: request.model,
			occurredAt: new Date(),
			payload: output,
		}
	}
}
