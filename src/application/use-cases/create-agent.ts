import { Agent } from "@domain/agentic-environment/participant/agent"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "@domain/agentic-environment/situation/situation-handler"

export function createAgent({
	name,
	capabilities,
	instruction,
	tools,
	handlers,
}: {
	name: string
	capabilities: readonly string[]
	instruction: string
	tools: Tool[]
	handlers: SituationHandler[]
}): Agent {
	return Agent.create({ name, capabilities, instruction, tools, handlers })
}
