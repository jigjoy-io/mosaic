import { Human } from "@domain/agentic-environment/participant/human"
import { SituationHandler } from "@domain/agentic-environment/situation/situation-handler"

export function createHuman({
	name,
	capabilities,
	handlers,
}: {
	name: string
	capabilities: readonly string[]
	handlers: SituationHandler[]
}): Human {
	return Human.create({ name, capabilities, handlers })
}
