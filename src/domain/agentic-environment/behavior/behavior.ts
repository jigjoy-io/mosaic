import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { DecisionSpecification } from "./decision-specification"
import { BoundAction, WorkingMemory } from "../agent/memory"

export class Behavior {
	private constructor(
		private readonly id: string,
		private decisionSpecification: DecisionSpecification,
		private boundActions: BoundAction[],
	) {}

	getId(): string {
		return this.id
	}

	getDecisionSpecification(): DecisionSpecification {
		return this.decisionSpecification
	}

	getBoundActions(): BoundAction[] {
		return this.boundActions
	}

	async *execute(event: SemanticEvent, workingMemory: WorkingMemory): AsyncIterable<SemanticEvent> {
		const isSatisfied = this.decisionSpecification.isSatisfiedBy(event, workingMemory)

		if (!isSatisfied) {
			return
		}

		for (const boundAction of this.boundActions) {
			yield* boundAction.execute(event, workingMemory)
		}
	}

	static create({ when, then }: { when: DecisionSpecification; then: BoundAction[] }): Behavior {
		const id = crypto.randomUUID()
		return new Behavior(id, when, then)
	}

	static rehydrate(id: string, decisionSpecification: DecisionSpecification, actions: BoundAction[]): Behavior {
		return new Behavior(id, decisionSpecification, actions)
	}
}
