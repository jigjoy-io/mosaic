import { Participant } from "./participant"

export abstract class RuntimeState {
	participants: readonly Participant[] = []

	addParticipant(participant: Participant): void {
		this.participants = [...this.participants, participant]
	}

	removeParticipant(participant: Participant): void {
		this.participants = this.participants.filter((p) => p !== participant)
	}

	getParticipants(): readonly Participant[] {
		return this.participants
	}
}
