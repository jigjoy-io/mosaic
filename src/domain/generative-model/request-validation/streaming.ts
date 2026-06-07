import { ModelSpecification } from "@domain/generative-model/generative-model"
import { RequestValidationRule } from "./rule"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName } from "@domain/generative-model/generative-model"

export class StreamingValidation implements RequestValidationRule {
	readonly name = "streaming"

	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
		if (inferenceParams.streaming === undefined) {
			return true
		}

		return model.supportsStreaming
	}
}
