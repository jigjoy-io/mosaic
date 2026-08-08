import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"

export class ReasoningEffortValidation implements RequestValidationRule {
	readonly name = "reasoning-effort"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (inferenceRequest.reasoningEffort === undefined) {
			return true
		}

		if (!model.supportsReasoningEffort) {
			return false
		}

		return model.supportedReasoningEfforts.includes(inferenceRequest.reasoningEffort)
	}
}
