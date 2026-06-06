
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export interface Endpoint {
	infer(request: unknown): Promise<InferenceResponse>
	stream(request: unknown): AsyncIterable<SemanticEvent<unknown>>
}