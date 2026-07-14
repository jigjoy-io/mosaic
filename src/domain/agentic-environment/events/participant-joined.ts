import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ParticipantManifest } from "../participant-manifest"

export class ParticipantJoinedEvent extends SemanticEvent {
	readonly type = "participant.joined"

	constructor(
		producerId: string,
		occurredAt: Date,
		readonly manifest: ParticipantManifest,
	) {
		super(producerId, occurredAt)
	}

	static create({
		producerId,
		manifest,
	}: {
		producerId: string
		manifest: ParticipantManifest
	}): ParticipantJoinedEvent {
		return new ParticipantJoinedEvent(producerId, new Date(), manifest)
	}
}
