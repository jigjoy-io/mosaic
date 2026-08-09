export type ParticipantRole = "agent" | "human"

export type ParticipantManifest = {
	readonly name: string
	readonly role: ParticipantRole
	readonly capabilities?: readonly string[]
}

export abstract class Participant {
	readonly id: string
	private manifest: ParticipantManifest

	protected constructor(id: string, manifest: ParticipantManifest) {
		this.id = id
		this.manifest = manifest
	}

	getId(): string {
		return this.id
	}

	getManifest(): ParticipantManifest {
		return this.manifest
	}
}
