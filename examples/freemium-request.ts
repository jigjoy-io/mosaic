import { Action, InferenceParams, resolveInferenceRunner, SemanticEvent, UserMessageItem } from "src"
import { ParticipantMessage } from "@domain/agentic-environment/events/participant-message"
import { resolveParticipant } from "./runtime"

export class FreemiumAction implements Action {
	private readonly inferenceRunner = resolveInferenceRunner()

	async *process(event: ParticipantMessage): AsyncIterable<SemanticEvent> {
		const participant = resolveParticipant(event.getProducerId())
		const message = `${event.getProducerId()}: ${event.getMessage()}`
		let context = participant.memory.getContext()
		context.addItem(UserMessageItem.create(message))

		const inferenceParams: InferenceParams = {
			context,
			model: "gpt-5.5",
			caller: event.getProducerId(),
		}

		yield* this.inferenceRunner.execute(inferenceParams)
	}
}
