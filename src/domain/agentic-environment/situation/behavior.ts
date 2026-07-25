import { Constraint } from "./constraint"
import { Action } from "./action"

export class Behavior {
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

	static create({ when, then }: { when: Constraint; then: Action[] }): Behavior {
		const id = crypto.randomUUID()
		return new Behavior(id, when, then)
	}

	static rehydrate(id: string, constraint: Constraint, actions: Action[]): Behavior {
		return new Behavior(id, constraint, actions)
	}
}
