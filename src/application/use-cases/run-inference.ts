import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { RunInferenceUseCase } from "@domain/agentic-environment/use-cases/run-inference"
import type { InferenceRunner } from "@app/services/inference-runner"
import { NonStreamingInference, StreamingInference } from "@app/services/inference-runner"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import type { ModelName } from "@domain/generative-model/generative-model"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"

export class RunInference implements RunInferenceUseCase<ModelName> {
	constructor(
		private readonly generativeModelRepository: GenerativeModelRepository,
		private readonly requestValidator: InferenceRequestValidator,
	) {}

	async execute(inferenceParams: InferenceParams<ModelName>): Promise<void> {
		const { caller, channel, signal } = inferenceParams

		const generativeModel = await this.generativeModelRepository.getByModelName(inferenceParams.model)

		this.requestValidator.validate(inferenceParams, generativeModel.specification)

		const resolvedParams: InferenceParams<ModelName> = {
			...inferenceParams,
			maxOutputTokens: inferenceParams.maxOutputTokens ?? generativeModel.specification.maxOutputTokens,
		}

		const inferenceRunner: InferenceRunner = inferenceParams.streaming
			? new StreamingInference()
			: new NonStreamingInference()

		const result = inferenceRunner.run(resolvedParams, generativeModel.endpoint)

		for await (const item of result) {
			if (signal?.aborted) {
				break
			}
			if (item instanceof ReasoningItem) {
				channel.deliver(
					SemanticEvent.create({ type: "reasoning", producerId: caller.getProfile().getId(), data: item }),
				)
			} else if (item instanceof FunctionCallItem) {
				channel.deliver(
					SemanticEvent.create({
						type: "function_call",
						producerId: caller.getProfile().getId(),
						data: item,
					}),
				)
			} else if (item instanceof ModelMessageItem) {
				channel.deliver(
					SemanticEvent.create({
						type: "model_message",
						producerId: caller.getProfile().getId(),
						data: item,
					}),
				)
			} else if (item instanceof SemanticEvent) {
				channel.deliver(
					SemanticEvent.create({
						type: "semantic_event",
						producerId: caller.getProfile().getId(),
						data: item,
					}),
				)
			}
		}
	}
}
