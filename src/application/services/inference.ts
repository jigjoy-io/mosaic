import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"
import { Action } from "@domain/agentic-environment/participant/process/process"

export class Inference implements Action<InferenceParams> {
	id: string = "inference"

	constructor(
		private readonly generativeModelRepository: GenerativeModelRepository,
		private readonly requestValidator: InferenceRequestValidator,
	) {}

	async *run(input: InferenceParams): AsyncIterable<SemanticEvent> {
		const { signal } = input

		const generativeModel = await this.generativeModelRepository.getByModelName(input.model)

		this.requestValidator.validate(input, generativeModel.specification)

		if (input.streaming) {
			yield* generativeModel.endpoint.stream(input, signal)
		} else {
			const response = await generativeModel.endpoint.infer(input)
			yield {
				type: "inference.completed",
				producerId: input.callerId,
				occurredAt: new Date(),
				payload: response,
			}
		}
	}
}
