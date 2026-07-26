import { Constraint, Participant, SemanticEvent } from "src"

export class ParticipantMessageConstraint extends Constraint {
	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		if (consumer.getId() !== event.getProducerId()) {
			return false
		}

		return event.getType() === "participant_message"
	}
}
