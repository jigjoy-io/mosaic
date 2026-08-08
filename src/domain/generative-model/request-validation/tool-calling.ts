import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"
import type { InferenceRequest } from "@domain/agentic-environment/inference/request"

export class ToolCallingValidation implements RequestValidationRule {
	readonly name = "tool-calling"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (inferenceRequest.tools === undefined) {
			return true
		}

		return model.supportsFunctionCalling
	}
}
