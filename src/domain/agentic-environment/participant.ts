import { ParticipantManifest } from "./participant-manifest"

export abstract class Participant {
	constructor(readonly manifest: ParticipantManifest) {}

	getManifest(): ParticipantManifest {
		return this.manifest
	}
}
