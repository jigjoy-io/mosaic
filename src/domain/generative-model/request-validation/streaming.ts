import type { ModelSpecification } from "@domain/generative-model/generative-model"
import type { RequestValidationRule } from "./rule"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"

export class StreamingValidation implements RequestValidationRule {
	readonly name = "streaming"

	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
		if (!inferenceParams.streaming) {
			return true
		}

		return model.supportsStreaming
	}
}
