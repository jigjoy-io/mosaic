import { Participant } from "@domain/agentic-environment/participant/participant"
import { ParticipantManifest } from "@domain/agentic-environment/participant/participant-manifest"

export function createParticipant({ name }: { name: string }): Participant {
	const manifest = ParticipantManifest.create({ name })
	return Participant.create({ manifest })
}
