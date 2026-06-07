import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ModelName } from "@domain/generative-model/generative-model"
import { InferenceEndpointMapper } from "./inference-endpoint-mapper"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceParams<ModelName>): Promise<InferenceResponse>
	stream(requestParams: InferenceParams<ModelName>, signal?: AbortSignal): AsyncIterable<SemanticEvent<unknown>>
}
