import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import type { ModelName } from "./generative-model"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"

export interface InferenceEndpointMapper {
	toRequest(inferenceParams: InferenceParams<ModelName>): any
	toResponse(response: any): InferenceResponse
}
