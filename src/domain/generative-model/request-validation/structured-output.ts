import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelSpecification } from "../generative-model"
import type { RequestValidationRule } from "./rule"

export type StructuredOutputFormat = {
	name?: string
	schema: Record<string, any>
	strict?: boolean
}

export class StructuredOutputValidation implements RequestValidationRule {
	readonly name = "structured-output"

	isValid(inferenceParams: InferenceParams, model: ModelSpecification): boolean {
		if (inferenceParams.structuredOutput === undefined) {
			return true
		}

		return model.supportsStructuredOutput
	}
}
