import { EventMapper } from "@domain/agentic-environment/agent/memory"
import { SemanticEvent } from "src"

export class UserMessageEvent extends SemanticEvent {
	type = "user_message"
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

	static create(producerId: string, message: string): UserMessageEvent {
		return new UserMessageEvent(producerId, new Date(), message)
	}
}

export class UserMessageEventMapper implements EventMapper<string> {
	map(event: UserMessageEvent): string {
		return event.getMessage()
	}
}
