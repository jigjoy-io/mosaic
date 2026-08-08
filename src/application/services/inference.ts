import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"
import { InferenceRunner } from "@domain/agentic-environment/inference/inference-runner"

export type InferenceCompletedParams = { answer: string; producerId: string; price?: number }

export class DefaultInferenceRunner implements InferenceRunner {
	constructor(
		private readonly generativeModelRepository: GenerativeModelRepository,
		private readonly requestValidator: InferenceRequestValidator,
	) {}

	async *run(input: InferenceRequest): AsyncIterable<SemanticEvent> {
		const generativeModel = await this.generativeModelRepository.getByModelName(input.model)

		this.requestValidator.validate(input, generativeModel.specification)

		if (input.streaming) {
			return generativeModel.endpoint.stream(input)
		} else {
			return await generativeModel.endpoint.infer(input)
		}
	}
}
