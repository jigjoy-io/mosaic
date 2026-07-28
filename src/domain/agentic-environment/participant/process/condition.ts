import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { Participant } from "../participant"

export abstract class Condition {
	abstract isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean

	and(other: Condition): Condition {
		return new AndCondition(this, other)
	}

	or(other: Condition): Condition {
		return new OrCondition(this, other)
	}

	not(): Condition {
		return new NotCondition(this)
	}
}

class AndCondition extends Condition {
	constructor(
		private readonly left: Condition,
		private readonly right: Condition,
	) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		return this.left.isSatisfiedBy(event, consumer) && this.right.isSatisfiedBy(event, consumer)
	}
}

class OrCondition extends Condition {
	constructor(
		private readonly left: Condition,
		private readonly right: Condition,
	) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		return this.left.isSatisfiedBy(event, consumer) || this.right.isSatisfiedBy(event, consumer)
	}
}

class NotCondition extends Condition {
	constructor(private readonly condition: Condition) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		return !this.condition.isSatisfiedBy(event, consumer)
	}
}
