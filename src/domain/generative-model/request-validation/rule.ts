import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelSpecification } from "../generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceParams: InferenceParams, model: ModelSpecification): boolean
}
