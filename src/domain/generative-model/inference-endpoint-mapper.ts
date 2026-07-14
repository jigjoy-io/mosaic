import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"

export interface InferenceEndpointMapper {
	toRequest(inferenceParams: InferenceParams): any
	toResponse(response: any): InferenceResponse
}
