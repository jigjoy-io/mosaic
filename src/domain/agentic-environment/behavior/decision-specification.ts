import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Memory } from "../agent/memory"

export abstract class DecisionSpecification {
	abstract isSatisfiedBy(event: SemanticEvent, memory: Memory): boolean

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

	isSatisfiedBy(event: SemanticEvent, memory: Memory): boolean {
		return this.left.isSatisfiedBy(event, memory) && this.right.isSatisfiedBy(event, memory)
	}
}

class OrDecisionSpecification extends DecisionSpecification {
	constructor(
		private readonly left: DecisionSpecification,
		private readonly right: DecisionSpecification,
	) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, memory: Memory): boolean {
		return this.left.isSatisfiedBy(event, memory) || this.right.isSatisfiedBy(event, memory)
	}
}

class NotDecisionSpecification extends DecisionSpecification {
	constructor(private readonly specification: DecisionSpecification) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, memory: Memory): boolean {
		return !this.specification.isSatisfiedBy(event, memory)
	}
}
