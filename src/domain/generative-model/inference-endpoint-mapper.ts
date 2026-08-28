import type { InferenceInput, InferenceOutput } from "@app/states/inference"

export interface InferenceEndpointMapper {
	toRequest(inferenceInput: InferenceInput): any
	toResponse(response: any): InferenceOutput
}
