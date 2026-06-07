import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName, ModelSpecification } from "../generative-model"
import { RequestValidationRule } from "./rule"

export type StructuredOutputFormat = {
	name?: string
	schema: Record<string, any>
	strict?: boolean
}

export class StructuredOutputValidation implements RequestValidationRule {
	readonly name = "structured-output"

	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
		if (inferenceParams.structuredOutput === undefined) {
			return true
		}

		return model.supportsStructuredOutput
	}
}
