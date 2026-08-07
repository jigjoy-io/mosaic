import { Action } from "@domain/agentic-environment/participant/action"
import { SituationContext } from "@domain/agentic-environment/participant/situation"
import { SituationSpecification } from "@domain/agentic-environment/participant/situation-specification"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export class ParticipantMessageSent extends SituationSpecification {
	readonly conditionId = "participant.message.sent"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "participant.message.sent"
	}
}

export class SendMessage implements Action<{ answer: string; producerId: string }> {
	readonly actionId: string = "answer"

	async *run({ answer, producerId }: { answer: string; producerId: string }): AsyncIterable<SemanticEvent> {
		const messageText = `${producerId}: ${answer}`

		yield {
			type: "participant.message.sent",
			producerId: producerId,
			occurredAt: new Date(),
			payload: {
				message: messageText,
			},
		}
	}
}
