import { Participant, ParticipantManifest } from "./participant"

export class Human extends Participant {
	constructor(manifest: ParticipantManifest) {
		super(manifest)
	}

	static create({ name, capabilities }: { name: string; capabilities: readonly string[] }): Human {
		const id = crypto.randomUUID()
		const manifest: ParticipantManifest = { id, name, capabilities, role: "human" }
		return new Human(manifest)
	}
}
