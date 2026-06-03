import { ModelContext } from "@domain/model-context/model-context"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { ReasoningEffort } from "@domain/generative-model/capabilities/reasoning-effort"
import { StructuredOutputCapability } from "@domain/generative-model/capabilities/structured-output"
import { ToolCallingCapability } from "@domain/generative-model/capabilities/tool-calling"

export class InferenceRequest {
	readonly model: GenerativeModel & ReasoningEffort<string> & ToolCallingCapability & StructuredOutputCapability
	readonly context: ModelContext

	constructor(
		model: GenerativeModel & ReasoningEffort<string> & ToolCallingCapability & StructuredOutputCapability,
		context: ModelContext,
	) {
		this.model = model
		this.context = context
	}
}
