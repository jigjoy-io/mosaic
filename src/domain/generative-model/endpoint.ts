import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import type { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceEndpointMapper } from "./inference-endpoint-mapper"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceRequest): Promise<InferenceResponse>
	stream(requestParams: InferenceRequest): AsyncIterable<SemanticEvent>
}
