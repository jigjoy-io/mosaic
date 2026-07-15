import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "./participant"

export class Channel {
	private participants: Participant[] = []

	deliver(event: SemanticEvent): void {
		for (const participant of this.participants) {
			participant.process(event)
		}
	}

	subscribe(participant: Participant) {
		this.participants.push(participant)
	}

	unsubscribe(participant: Participant) {
		this.participants = this.participants.filter((p) => p !== participant)
	}
}
