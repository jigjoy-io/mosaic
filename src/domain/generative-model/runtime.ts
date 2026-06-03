import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export interface SequentialInferenceRuntime {
	infer(request: InferenceRequest): Promise<InferenceResponse>
}

export interface StreamingInferenceRuntime {
	stream(
		request: InferenceRequest,
	): AsyncIterable<SemanticEvent<unknown>>
}

export type InferenceRuntime = SequentialInferenceRuntime | StreamingInferenceRuntime