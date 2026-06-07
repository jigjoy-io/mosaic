import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { Endpoint } from "@domain/generative-model/endpoint"
import OpenAI from "openai"
import { ModelName } from "@domain/generative-model/generative-model"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { OpenAIResponsesMapper } from "./openai-responses-mapper"
import { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

export class OpenAIResponses implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private readonly client: OpenAI

	constructor(endpointMapper: OpenAIResponsesMapper) {
		this.endpointMapper = endpointMapper
		this.client = new OpenAI()
	}

	async infer(inferenceParams: InferenceParams<ModelName>): Promise<InferenceResponse> {
		const request = this.endpointMapper.toRequest(inferenceParams)
		const response = await this.client.responses.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(
		inferenceParams: InferenceParams<ModelName>,
		signal?: AbortSignal,
	): AsyncIterable<SemanticEvent<unknown>> {
		const request = this.endpointMapper.toRequest(inferenceParams)
		const response: any = await this.client.responses.create(request)

		for await (const event of response) {
			if (signal?.aborted) {
				break
			}
			yield new SemanticEvent(event.type, event)
		}
	}
}
