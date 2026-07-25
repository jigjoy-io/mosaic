import { Agent } from "@domain/agentic-environment/participant/agent"
import { Behavior } from "@domain/agentic-environment/participant/behavior/behavior"
import { AgentManifest, AgentManifestParams } from "@domain/agentic-environment/participant/agent-manifest"

export function createAgent({
	manifest,
	behaviors,
}: {
	manifest: AgentManifestParams
	behaviors: readonly Behavior[]
}): Agent {
	const agentManifest = AgentManifest.create(manifest)
	return Agent.create({ manifest: agentManifest, behaviors })
}
