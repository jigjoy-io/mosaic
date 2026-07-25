import { Constraint } from "@domain/agentic-environment/agent/constraint"
import { Action } from "@domain/agentic-environment/agent/action"
import { Behavior } from "@domain/agentic-environment/agent/behavior"

export function createBehavior({ when, then }: { when: Constraint; then: Action[] }): Behavior {
	return Behavior.create({
		when,
		then,
	})
}
