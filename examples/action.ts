import { Action, InferenceParams, resolveInferenceRunner, SemanticEvent, UserMessageItem } from "src"
import { ParticipantMessage } from "@domain/agentic-environment/events/participant-message"
import { Agent } from "@domain/agentic-environment/participant/agent"

export class FreemiumAction implements Action {
	private readonly inferenceRunner = resolveInferenceRunner()

	async *process(event: ParticipantMessage, consumer: Agent): AsyncIterable<SemanticEvent> {
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
