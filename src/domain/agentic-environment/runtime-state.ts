import { Participant } from "./participant/participant"

export abstract class RuntimeState {
	participants: Map<string, Participant> = new Map()

	addParticipant(participant: Participant): void {
		const isExists = this.participants.get(participant.getId())

		if (isExists) return

		this.participants.set(participant.getId(), participant)
	}

	removeParticipant(participant: Participant): void {
		this.participants.delete(participant.getId())
	}

	getParticipant(id: string): Participant | undefined {
		return this.participants.get(id)
	}

	getParticipants(): readonly Participant[] {
		return [...this.participants.values()]
	}
}
