import { RequestValidationRule } from "./rule"
import { ModelName, ModelSpecification } from "../generative-model"
import { InferenceParams } from "@domain/agentic-environment/inference/params"

export class ToolCallingValidation implements RequestValidationRule {
	readonly name = "tool-calling"

	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
		if (inferenceParams.tools === undefined) {
			return true
		}

		return model.supportsFunctionCalling
	}
}
