export abstract class DecisionSpecification<T> {
	abstract isSatisfiedBy(candidate: T): boolean

	and(other: DecisionSpecification<T>): DecisionSpecification<T> {
		return new AndDecisionSpecification(this, other)
	}

	or(other: DecisionSpecification<T>): DecisionSpecification<T> {
		return new OrDecisionSpecification(this, other)
	}

	not(): DecisionSpecification<T> {
		return new NotDecisionSpecification(this)
	}
}

class AndDecisionSpecification<T> extends DecisionSpecification<T> {
	constructor(
		private readonly left: DecisionSpecification<T>,
		private readonly right: DecisionSpecification<T>,
	) {
		super()
	}

	isSatisfiedBy(candidate: T): boolean {
		return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
	}
}

class OrDecisionSpecification<T> extends DecisionSpecification<T> {
	constructor(
		private readonly left: DecisionSpecification<T>,
		private readonly right: DecisionSpecification<T>,
	) {
		super()
	}

	isSatisfiedBy(candidate: T): boolean {
		return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
	}
}

class NotDecisionSpecification<T> extends DecisionSpecification<T> {
	constructor(private readonly specification: DecisionSpecification<T>) {
		super()
	}

	isSatisfiedBy(candidate: T): boolean {
		return !this.specification.isSatisfiedBy(candidate)
	}
}
