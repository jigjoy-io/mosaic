import { Behavior } from "./behavior/behavior"
import { Memory } from "./memory"
import { ParticipantManifest } from "./participant-manifest"

export class Participant {
	protected constructor(
		readonly id: string,
		readonly manifest: ParticipantManifest,
		readonly behaviors: readonly Behavior[],
		readonly memory: Memory,
	) {}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	getId(): string {
		return this.id
	}

	static create({
		manifest,
		behaviors,
	}: {
		manifest: ParticipantManifest
		behaviors: readonly Behavior[]
	}): Participant {
		const memory = Memory.create()
		return new Participant(manifest.getName(), manifest, behaviors, memory)
	}
}
