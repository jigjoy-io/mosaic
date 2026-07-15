import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { InferenceRunner } from "@app/services/inference-runner"
import { NonStreamingInference, StreamingInference } from "@app/services/inference-runner"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"
import { Action } from "@domain/agentic-environment/participant"

export class RunInference extends Action {
	constructor(
		private readonly generativeModelRepository: GenerativeModelRepository,
		private readonly requestValidator: InferenceRequestValidator,
	) {
		super()
	}

	async *execute({ inferenceParams }: { inferenceParams: InferenceParams }): AsyncIterable<SemanticEvent> {
		const { channel, signal } = inferenceParams

		const generativeModel = await this.generativeModelRepository.getByModelName(inferenceParams.model)

		this.requestValidator.validate(inferenceParams, generativeModel.specification)

		const resolvedParams: InferenceParams = {
			...inferenceParams,
			maxOutputTokens: inferenceParams.maxOutputTokens ?? generativeModel.specification.maxOutputTokens,
		}

		const inferenceRunner: InferenceRunner = inferenceParams.streaming
			? new StreamingInference()
			: new NonStreamingInference()

		const result = inferenceRunner.run(resolvedParams, generativeModel.endpoint)

		for await (const event of result) {
			if (signal?.aborted) {
				break
			}

			channel.deliver(event)
		}
	}
}
