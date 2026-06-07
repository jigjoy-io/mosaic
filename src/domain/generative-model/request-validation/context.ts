import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { RequestValidationRule } from "./rule"
import { ModelName, ModelSpecification } from "../generative-model"

export class ContextValidation implements RequestValidationRule {
	readonly name = "context"

	isValid(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
		return inferenceParams.context.items.every((item) => model.supportedContextItemTypes.includes(item.getType()))
	}
}
