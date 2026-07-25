import { Behavior } from "@domain/agentic-environment/participant/behavior/behavior"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { ParticipantManifest } from "@domain/agentic-environment/participant/participant-manifest"

export function createParticipant({ name, behaviors }: { name: string; behaviors: readonly Behavior[] }): Participant {
	const manifest = ParticipantManifest.create({ name })
	return Participant.create({ manifest, behaviors })
}
