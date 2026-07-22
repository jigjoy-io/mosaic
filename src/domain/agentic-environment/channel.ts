import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "./participant"

export class Channel {
	private participants: Participant[] = []

	async *deliver(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		for (const participant of this.participants) {
			yield* participant.process(event)
		}
	}

	subscribe(participant: Participant) {
		this.participants.push(participant)
	}

	unsubscribe(participant: Participant) {
		this.participants = this.participants.filter((p) => p !== participant)
	}

	getParticipants(): Participant[] {
		return this.participants
	}
}
