import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Constraint } from "./constraint"
import { Action } from "./action"

export class EventProcessor {
	private constructor(
		private readonly id: string,
		private constraint: Constraint,
		private actions: Action[],
	) {}

	getId(): string {
		return this.id
	}

	getConstraint(): Constraint {
		return this.constraint
	}

	getActions(): Action[] {
		return this.actions
	}

	async *reactTo(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		const isSatisfied = this.constraint.isSatisfiedBy(event)

		if (!isSatisfied) {
			return
		}

		for (const action of this.actions) {
			yield* action.process(event)
		}
	}

	static create({ when, then }: { when: Constraint; then: Action[] }): EventProcessor {
		const id = crypto.randomUUID()
		return new EventProcessor(id, when, then)
	}

	static rehydrate(id: string, constraint: Constraint, actions: Action[]): EventProcessor {
		return new EventProcessor(id, constraint, actions)
	}
}
