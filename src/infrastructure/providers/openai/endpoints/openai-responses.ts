import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceOutput } from "@app/states/inference"
import type { Endpoint } from "@domain/generative-model/endpoint"
import OpenAI from "openai"
import type { InferenceInput } from "@app/states/inference"
import { OpenAIResponsesMapper } from "./openai-responses-mapper"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

export class OpenAIResponses implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private readonly client: OpenAI

	constructor(endpointMapper: InferenceEndpointMapper = new OpenAIResponsesMapper()) {
		this.endpointMapper = endpointMapper
		this.client = new OpenAI()
	}

	async infer(inferenceInput: InferenceInput): Promise<InferenceOutput> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const response = await this.client.responses.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceInput: InferenceInput): AsyncIterable<SemanticEvent> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const response: any = await this.client.responses.create(request)

		for await (const event of response) {
			yield event
		}
	}
}
