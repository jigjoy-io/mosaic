import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export interface Endpoint {
	infer(request: InferenceRequest): Promise<InferenceResponse>
	stream(request: InferenceRequest): AsyncIterable<SemanticEvent<unknown>>
}