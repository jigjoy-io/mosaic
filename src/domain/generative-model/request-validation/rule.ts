import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName, ModelSpecification } from "../generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean
}
