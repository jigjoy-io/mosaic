import { EventMapper } from "@domain/agentic-environment/agent/memory"
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

export class UserMessageEventMapper implements EventMapper<string> {
	map(event: UserMessageEvent): string {
		return event.getMessage()
	}
}
