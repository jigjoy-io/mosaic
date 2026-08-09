import { Human } from "@domain/agentic-environment/participant/human"
import { ParticipantManifest } from "@domain/agentic-environment/participant/participant"

export function createHuman({ name, capabilities }: { name: string; capabilities: readonly string[] }): Human {
	const manifest: ParticipantManifest = { name, capabilities, role: "human" }
	return Human.create({ manifest })
}
