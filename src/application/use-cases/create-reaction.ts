import { Constraint } from "@domain/agentic-environment/behavior/constraint"
import { Action } from "@domain/agentic-environment/behavior/action"
import { EventProcessor } from "@domain/agentic-environment/behavior/event-processor"

export function createEventProcessor({ when, then }: { when: Constraint; then: Action[] }): EventProcessor {
	return EventProcessor.create({
		when,
		then,
	})
}
