import { WorkingMemory } from "../agent/memory"

export abstract class DecisionSpecification {
	abstract isSatisfiedBy(workingMemory: WorkingMemory): boolean

	and(other: DecisionSpecification): DecisionSpecification {
		return new AndDecisionSpecification(this, other)
	}

	or(other: DecisionSpecification): DecisionSpecification {
		return new OrDecisionSpecification(this, other)
	}

	not(): DecisionSpecification {
		return new NotDecisionSpecification(this)
	}
}

class AndDecisionSpecification extends DecisionSpecification {
	constructor(
		private readonly left: DecisionSpecification,
		private readonly right: DecisionSpecification,
	) {
		super()
	}

	isSatisfiedBy(workingMemory: WorkingMemory): boolean {
		return this.left.isSatisfiedBy(workingMemory) && this.right.isSatisfiedBy(workingMemory)
	}
}

class OrDecisionSpecification extends DecisionSpecification {
	constructor(
		private readonly left: DecisionSpecification,
		private readonly right: DecisionSpecification,
	) {
		super()
	}

	isSatisfiedBy(workingMemory: WorkingMemory): boolean {
		return this.left.isSatisfiedBy(workingMemory) || this.right.isSatisfiedBy(workingMemory)
	}
}

class NotDecisionSpecification extends DecisionSpecification {
	constructor(private readonly specification: DecisionSpecification) {
		super()
	}

	isSatisfiedBy(workingMemory: WorkingMemory): boolean {
		return !this.specification.isSatisfiedBy(workingMemory)
	}
}
