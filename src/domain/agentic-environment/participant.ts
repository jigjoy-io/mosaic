import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgentProfile } from "./participant-profile"

export abstract class Participant<T> {
	readonly profile: T

	constructor(profile: T) {
		this.profile = profile
	}

	getProfile(): T {
		return this.profile
	}

	abstract onEvent(event: SemanticEvent<unknown>): void
}

export class AgentParticipant extends Participant<AgentProfile> {
	onEvent(event: SemanticEvent<unknown>): void {
		if (event.type === "message") {
			this.onMessage(event)
		}
	}

	onMessage(event: SemanticEvent<unknown>): void {
		throw new Error("Method not implemented.")
	}

	constructor(profile: AgentProfile) {
		super(profile)
	}
}
