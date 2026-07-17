import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Action } from "./action"
import { DecisionSpecification } from "./decision-specification"
import { WorkingMemory } from "../agent/memory"

export class Behavior {
	constructor(
		private readonly decisionSpecification: DecisionSpecification,
		private readonly actions: readonly Action[],
	) {}

	async *execute(workingMemory: WorkingMemory): AsyncIterable<SemanticEvent> {
		const decision = this.decisionSpecification.isSatisfiedBy(workingMemory)

		if (!decision) {
			return
		}

		for (const action of this.actions) {
			yield* action.execute(workingMemory)
		}
	}
}
