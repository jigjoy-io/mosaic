import { Participant, ParticipantManifest } from "./participant"

export class Human extends Participant {
	constructor(id: string, manifest: ParticipantManifest) {
		super(id, manifest)
	}

	static create({ manifest }: { manifest: ParticipantManifest }): Human {
		const id = crypto.randomUUID()
		return new Human(id, manifest)
	}
}
