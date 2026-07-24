import { Constraint } from "@domain/agentic-environment/behavior/specification"
import { Action } from "@domain/agentic-environment/behavior/action"
import { SituationMapper, SituationProcessing } from "@domain/agentic-environment/agent/memory"
import { Behavior } from "@domain/agentic-environment/behavior/behavior"

export function createBehavior<ActionParameters>({
	constraint,
	situationMapper,
	action,
}: {
	constraint: Constraint
	situationMapper: SituationMapper<ActionParameters>
	action: Action<ActionParameters>
}): Behavior {
	const situationProcessor = new SituationProcessing<ActionParameters>(situationMapper, action)
	return Behavior.create({
		when: constraint,
		then: [situationProcessor],
	})
}
