export type ParticipantRole = "agent" | "human"

export type ParticipantManifest = {
	readonly id: string
	readonly name: string
	readonly role: ParticipantRole
	readonly capabilities?: readonly string[]
}

export abstract class Participant {
	readonly manifest: ParticipantManifest

	protected constructor(manifest: ParticipantManifest) {
		this.manifest = manifest
	}

	getManifest(): ParticipantManifest {
		return this.manifest
	}
}
