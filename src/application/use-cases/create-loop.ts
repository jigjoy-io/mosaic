import { AgentLoop } from "@domain/agentic-environment/agent-loop"
import { ModelContext } from "@domain/model-context/model-context"

export function createLoop(message: string, agentId: string, modelContext: ModelContext) {
	const agentLoop = AgentLoop.create(message, agentId, modelContext)
	return agentLoop
}
