import { Participant, ParticipantManifest } from "./participant"
import { SituationHandler } from "./situation-handler"

export class Human extends Participant {
	constructor(manifest: ParticipantManifest, handlers: SituationHandler[]) {
		super(manifest, handlers)
	}

	static create({
		name,
		capabilities,
		handlers,
	}: {
		name: string
		capabilities: readonly string[]
		handlers: SituationHandler[]
	}): Human {
		const id = crypto.randomUUID()
		const manifest: ParticipantManifest = { id, name, capabilities, role: "human" }
		return new Human(manifest, handlers)
	}
}
