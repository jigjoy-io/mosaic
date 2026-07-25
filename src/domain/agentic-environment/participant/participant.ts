import { Behavior } from "../agent/behavior"
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
}
