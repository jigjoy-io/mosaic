import { Constraint } from "@domain/agentic-environment/participant/behavior/constraint"
import { Action } from "@domain/agentic-environment/participant/behavior/action"
import { Behavior } from "@domain/agentic-environment/participant/behavior/behavior"

export function createBehavior({ constraint, actions }: { constraint: Constraint; actions: Action[] }): Behavior {
	return Behavior.create({
		constraint,
		actions,
	})
}
