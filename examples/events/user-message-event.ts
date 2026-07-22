import { SemanticEvent } from "src"

export class UserMessageEvent extends SemanticEvent {
	type = "user_message"
	constructor(
		producerId: string,
		occurredAt: Date,
		private readonly message: string,
	) {
		super(producerId, occurredAt)
	}

	getMessage(): string {
		return this.message
	}
}
