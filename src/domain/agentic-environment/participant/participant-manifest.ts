export class ParticipantManifest {
	readonly name: string

	constructor(name: string) {
		this.name = name
	}

	getName(): string {
		return this.name
	}

	static create({ name }: { name: string }): ParticipantManifest {
		return new ParticipantManifest(name)
	}
}
