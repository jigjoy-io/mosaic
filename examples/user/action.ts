import { ParticipantMessage } from "@domain/agentic-environment/events/participant-message"
import { Action } from "@domain/agentic-environment/participant/behavior/action"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class AnswerAction implements Action {
	async *process(event: ParticipantMessage, consumer: Participant): AsyncIterable<SemanticEvent> {
		const message = `${event.getProducerId()}: ${event.getMessage()}`
		console.log(message)
	}
}
