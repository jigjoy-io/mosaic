import { Agent } from "@domain/agentic-environment/agent/agent"
import { AgentManifest } from "@domain/agentic-environment/participant-manifest"
import { Behavior } from "@domain/agentic-environment/behavior/behavior"
import { WorkingMemory } from "@domain/agentic-environment/agent/memory"

export const createAgent = ({
	manifest,
	behaviors,
	workingMemory,
}: {
	manifest: AgentManifest
	behaviors: Behavior[]
	workingMemory: WorkingMemory
}) => {
	return new Agent(manifest, behaviors, workingMemory)
}
