import { Constraint } from "@domain/agentic-environment/participant/behavior/constraint"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class ParticipantMessageConstraint extends Constraint {
	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		if (consumer.getId() !== event.getProducerId()) {
			return false
		}

		return event.getType() === "participant_message"
	}
}
