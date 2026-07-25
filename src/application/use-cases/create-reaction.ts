import { Constraint } from "@domain/agentic-environment/situation/constraint"
import { Action } from "@domain/agentic-environment/situation/action"
import { Behavior } from "@domain/agentic-environment/situation/behavior"

export function createBehavior({ when, then }: { when: Constraint; then: Action[] }): Behavior {
	return Behavior.create({
		when,
		then,
	})
}
