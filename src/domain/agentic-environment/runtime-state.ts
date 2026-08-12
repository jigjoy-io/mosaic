import { Participant } from "./participant/participant"

export abstract class RuntimeState {
	participants: readonly Participant[] = []

	addParticipant(participant: Participant): void {
		this.participants = [...this.participants, participant]
	}

	removeParticipant(participant: Participant): void {
		this.participants = this.participants.filter((p) => p !== participant)
	}

	getParticipant(id: string): Participant | undefined {
		return this.participants.find((p) => p.getId() === id)
	}

	getParticipants(): readonly Participant[] {
		return this.participants
	}
}
