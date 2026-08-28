import type { InferenceInput, InferenceOutput } from "@domain/agentic-environment/loop/states/inference"

export interface InferenceEndpointMapper {
	toRequest(inferenceInput: InferenceInput): any
	toResponse(response: any): InferenceOutput
}
