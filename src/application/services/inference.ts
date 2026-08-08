import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"

export type InferenceCompletedParams = { answer: string; producerId: string; price?: number }

export class InferenceRunner {
	constructor(
		private readonly generativeModelRepository: GenerativeModelRepository,
		private readonly requestValidator: InferenceRequestValidator,
	) {}

	async *run(input: InferenceRequest): AsyncIterable<SemanticEvent> {
		const { callerId } = input

		const generativeModel = await this.generativeModelRepository.getByModelName(input.model)

		this.requestValidator.validate(input, generativeModel.specification)

		if (input.streaming) {
			yield* generativeModel.endpoint.stream(input)
		} else {
			const response = await generativeModel.endpoint.infer(input)

			for (const item of response.contextItems) {
				if (item.type === "function.call") {
					yield {
						type: "function.call.requested",
						producerId: input.callerId,
						occurredAt: new Date(),
						payload: item,
					}
				}
			}
			yield {
				type: "inference.completed",
				producerId: callerId,
				occurredAt: new Date(),
				payload: response,
			}
		}
	}
}
