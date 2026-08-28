import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"
import type { InferenceInput } from "@domain/agentic-environment/loop/states/inference"

export class ToolCallingValidation implements RequestValidationRule {
	readonly name = "tool-calling"

	isValid(inferenceInput: InferenceInput, model: ModelSpecification): boolean {
		if (inferenceInput.tools === undefined) {
			return true
		}

		return model.supportsFunctionCalling
	}
}
