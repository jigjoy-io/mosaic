import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "../participant/participant"

export abstract class Constraint {
	abstract isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean

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

	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		return this.left.isSatisfiedBy(event, consumer) && this.right.isSatisfiedBy(event, consumer)
	}
}

class OrConstraint extends Constraint {
	constructor(
		private readonly left: Constraint,
		private readonly right: Constraint,
	) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		return this.left.isSatisfiedBy(event, consumer) || this.right.isSatisfiedBy(event, consumer)
	}
}

class NotConstraint extends Constraint {
	constructor(private readonly constraint: Constraint) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		return !this.constraint.isSatisfiedBy(event, consumer)
	}
}
