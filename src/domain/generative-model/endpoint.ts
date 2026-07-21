import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import type { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import type { InferenceEndpointMapper } from "./inference-endpoint-mapper"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceParams): Promise<InferenceResponse>
	stream(requestParams: InferenceParams, signal?: AbortSignal): AsyncIterable<SemanticEvent>
}
