import { Action, InferenceParams, resolveInferenceRunner, SemanticEvent, UserMessageItem } from "src"
import { FreemiumSituation } from "./freemium-siutaiton"

export class FreemiumAction implements Action {
	private readonly inferenceRunner = resolveInferenceRunner()

	async *process(situation: FreemiumSituation): AsyncIterable<SemanticEvent> {
		const { consumer, event } = situation
		const message = `${event.getProducerId()}: ${event.getMessage()}`

		let context = consumer.memory.getContext()
		context.addItem(UserMessageItem.create(message))

		const inferenceParams: InferenceParams = {
			context,
			model: "gpt-5.5",
			caller: event.getProducerId(),
		}

		yield* this.inferenceRunner.execute(inferenceParams)
	}
}
