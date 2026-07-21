import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"

export class ReasoningEffortValidation implements RequestValidationRule {
	readonly name = "reasoning-effort"

	isValid(inferenceParams: InferenceParams, model: ModelSpecification): boolean {
		if (inferenceParams.reasoningEffort === undefined) {
			return true
		}

		if (!model.supportsReasoningEffort) {
			return false
		}

		return model.supportedReasoningEfforts.includes(inferenceParams.reasoningEffort)
	}
}
