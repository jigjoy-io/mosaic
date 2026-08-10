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

	async *run(input: InferenceRequest): AsyncIterable<SemanticEvent | InferenceResponse> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		if (input.streaming) {
			yield* generativeModel.endpoint.stream(input)
		} else {
			const response = generativeModel.endpoint.infer(input)
			yield response
		}
	}
}
