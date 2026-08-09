import { Agent } from "@domain/agentic-environment/participant/agent"
import { Tool } from "@domain/generative-model/tool"

export function createAgent({
	name,
	capabilities,
	instruction,
	tools,
}: {
	name: string
	capabilities: readonly string[]
	instruction: string
	tools: Tool[]
}): Agent {
	return Agent.create({ name, capabilities, instruction, tools })
}
