import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { ModelName } from "./generative-model"
import { InferenceParams } from "@domain/agentic-environment/inference/params"

export interface InferenceEndpointMapper {
	toRequest(inferenceParams: InferenceParams<ModelName>): any
	toResponse(response: any): InferenceResponse
}
