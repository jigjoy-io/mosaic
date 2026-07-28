import { Agent } from "@domain/agentic-environment/participant/agent"
import { AgentManifest, AgentManifestParams } from "@domain/agentic-environment/participant/agent-manifest"

export function createAgent({ manifest }: { manifest: AgentManifestParams }): Agent {
	const agentManifest = AgentManifest.create(manifest)
	return Agent.create({ manifest: agentManifest })
}
