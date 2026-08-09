import { Human } from "@domain/agentic-environment/participant/human"

export function createHuman({ name, capabilities }: { name: string; capabilities: readonly string[] }): Human {
	return Human.create({ name, capabilities })
}
