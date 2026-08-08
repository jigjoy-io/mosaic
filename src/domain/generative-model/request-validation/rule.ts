import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
import type { ModelSpecification } from "../generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean
}
