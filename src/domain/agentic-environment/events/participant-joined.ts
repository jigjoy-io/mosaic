import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ParticipantManifest } from "../participant-manifest"

export class ParticipantJoined extends SemanticEvent {
	readonly type = "participant.joined"

	constructor(
		producerId: string,
		occurredAt: Date,
		readonly manifest: ParticipantManifest,
	) {
		super(producerId, occurredAt)
	}

	static create({ producerId, manifest }: { producerId: string; manifest: ParticipantManifest }): ParticipantJoined {
		return new ParticipantJoined(producerId, new Date(), manifest)
	}
}
