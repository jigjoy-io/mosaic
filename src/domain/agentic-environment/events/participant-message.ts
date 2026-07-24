import { SemanticEvent } from "src"

export class ParticipantMessage extends SemanticEvent {
	type = "participant_message"
	private constructor(
		producerId: string,
		occurredAt: Date,
		private readonly message: string,
	) {
		super(producerId, occurredAt)
	}

	getMessage(): string {
		return this.message
	}

	static create(producerId: string, message: string): ParticipantMessage {
		return new ParticipantMessage(producerId, new Date(), message)
	}
}
