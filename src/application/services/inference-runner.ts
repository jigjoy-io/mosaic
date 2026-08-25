import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"

export type InferenceCompletedParams = { answer: string; producerId: string; price?: number }

export class InferenceRunner {
	constructor(
		private readonly supportedModels: GenerativeModel[],
		private readonly requestValidator: InferenceRequestValidator,
	) {}

	async runInference(input: InferenceRequest): Promise<InferenceResponse> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		return generativeModel.endpoint.infer(input)
	}

	async streamInference(input: InferenceRequest) {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		return generativeModel.endpoint.stream(input)
	}
}
