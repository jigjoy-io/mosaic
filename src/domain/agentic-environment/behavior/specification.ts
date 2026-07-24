import { Situation } from "./situation"

export abstract class Constraint {
	abstract isSatisfiedBy(situation: Situation): boolean

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

	isSatisfiedBy(situation: Situation): boolean {
		return this.left.isSatisfiedBy(situation) && this.right.isSatisfiedBy(situation)
	}
}

class OrConstraint extends Constraint {
	constructor(
		private readonly left: Constraint,
		private readonly right: Constraint,
	) {
		super()
	}

	isSatisfiedBy(situation: Situation): boolean {
		return this.left.isSatisfiedBy(situation) || this.right.isSatisfiedBy(situation)
	}
}

class NotConstraint extends Constraint {
	constructor(private readonly constraint: Constraint) {
		super()
	}

	isSatisfiedBy(situation: Situation): boolean {
		return !this.constraint.isSatisfiedBy(situation)
	}
}
