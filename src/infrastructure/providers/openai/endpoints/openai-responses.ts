import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import type { Endpoint } from "@domain/generative-model/endpoint"
import OpenAI from "openai"
import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { OpenAIResponsesMapper } from "./openai-responses-mapper"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

export class OpenAIResponses implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private readonly client: OpenAI

	constructor(endpointMapper: InferenceEndpointMapper = new OpenAIResponsesMapper()) {
		this.endpointMapper = endpointMapper
		this.client = new OpenAI()
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResponse> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const response = await this.client.responses.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceRequest: InferenceRequest): AsyncIterable<SemanticEvent> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const response: any = await this.client.responses.create(request)

		for await (const event of response) {
			yield event
		}
	}
}
