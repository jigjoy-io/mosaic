import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"
import { Action } from "@domain/agentic-environment/participant/action"
import { SituationContext } from "@domain/agentic-environment/participant/situation"
import { SituationSpecification } from "@domain/agentic-environment/participant/situation-specification"

export type InferenceCompletedParams = { answer: string; producerId: string; price?: number }

export class Inference implements Action<InferenceParams> {
	readonly actionId: string = "inference"

	constructor(
		private readonly generativeModelRepository: GenerativeModelRepository,
		private readonly requestValidator: InferenceRequestValidator,
	) {}

	async *run(input: InferenceParams): AsyncIterable<SemanticEvent> {
		const { signal, callerId } = input

		const generativeModel = await this.generativeModelRepository.getByModelName(input.model)

		this.requestValidator.validate(input, generativeModel.specification)

		if (input.streaming) {
			yield* generativeModel.endpoint.stream(input, signal)
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

export class InferenceCompleted extends SituationSpecification {
	readonly conditionId = "inference.completed"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "inference.completed"
	}
}
