import { ModelContext } from "@domain/model-context/model-context"
import { GenerativeModel } from "@domain/generative-model/generative-model"

export class InferenceRequest {
	readonly model: GenerativeModel
	readonly context: ModelContext

	constructor(model: GenerativeModel, context: ModelContext) {
		this.model = model
		this.context = context
	}
}
