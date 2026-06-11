import type { RequestValidationRule } from "./rule"
import type { ModelName, ModelSpecification } from "../generative-model"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"

export class ToolCallingValidation implements RequestValidationRule {
	readonly name = "tool-calling"

	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
		if (inferenceParams.tools === undefined) {
			return true
		}

		return model.supportsFunctionCalling
	}
}
