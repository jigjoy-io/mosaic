import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName, ModelSpecification } from "../generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean
}
