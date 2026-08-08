import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import type { InferenceRequest } from "@domain/agentic-environment/inference/request"

export interface InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest): any
	toResponse(response: any): InferenceResponse
}
