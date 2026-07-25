import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export abstract class Constraint {
	abstract isSatisfiedBy(event: SemanticEvent): boolean

	and(other: Constraint): Constraint {
		return new AndConstraint(this, other)
	}

	or(other: Constraint): Constraint {
		return new OrConstraint(this, other)
	}

	not(): Constraint {
		return new NotConstraint(this)
	}
}

class AndConstraint extends Constraint {
	constructor(
		private readonly left: Constraint,
		private readonly right: Constraint,
	) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent): boolean {
		return this.left.isSatisfiedBy(event) && this.right.isSatisfiedBy(event)
	}
}

class OrConstraint extends Constraint {
	constructor(
		private readonly left: Constraint,
		private readonly right: Constraint,
	) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent): boolean {
		return this.left.isSatisfiedBy(event) || this.right.isSatisfiedBy(event)
	}
}

class NotConstraint extends Constraint {
	constructor(private readonly constraint: Constraint) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent): boolean {
		return !this.constraint.isSatisfiedBy(event)
	}
}
