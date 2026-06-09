import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { RequestValidationRule } from "./rule"
import { ModelName, ModelSpecification } from "../generative-model"

export class ReasoningEffortValidation implements RequestValidationRule {
	readonly name = "reasoning-effort"

	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
		if (inferenceParams.reasoningEffort === undefined) {
			return true
		}

		if (!model.supportsReasoningEffort) {
			return false
		}

		return model.supportedReasoningEfforts.includes(inferenceParams.reasoningEffort)
	}
}
