import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
import type { ContextItem } from "@domain/model-context/context-item/context-item"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"

function getContextItemValidationKey(item: ContextItem): string {
	if (item instanceof UserMessageItem) {
		return "user_message"
	}
	if (item instanceof SystemMessageItem) {
		return "system_message"
	}
	if (item instanceof DeveloperMessageItem) {
		return "developer_message"
	}
	if (item instanceof ModelMessageItem) {
		return "model_message"
	}
	return item.getType()
}

export class ContextValidation implements RequestValidationRule {
	readonly name = "context"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		return inferenceRequest.context.items.every((item) =>
			model.supportedContextItemTypes.includes(getContextItemValidationKey(item)),
		)
	}
}
