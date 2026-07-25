import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import { InferenceStrategy, NonStreamingInference, StreamingInference } from "@app/services/inference-strategy"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"

export class InferenceRunner {
	constructor(
		private readonly generativeModelRepository: GenerativeModelRepository,
		private readonly requestValidator: InferenceRequestValidator,
	) {}

	async *execute(inferenceParams: InferenceParams): AsyncIterable<SemanticEvent> {
		const { signal } = inferenceParams

		const generativeModel = await this.generativeModelRepository.getByModelName(inferenceParams.model)

		this.requestValidator.validate(inferenceParams, generativeModel.specification)

		const resolvedParams: InferenceParams = {
			...inferenceParams,
			maxOutputTokens: inferenceParams.maxOutputTokens ?? generativeModel.specification.maxOutputTokens,
		}

		const inferenceRunner: InferenceStrategy = inferenceParams.streaming
			? new StreamingInference()
			: new NonStreamingInference()

		const result = inferenceRunner.run(resolvedParams, generativeModel.endpoint)

		for await (const event of result) {
			if (signal?.aborted) {
				break
			}
			yield event
		}
	}
}
