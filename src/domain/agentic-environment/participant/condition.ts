import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { SituationContext } from "./process"

export abstract class Condition<TEvent extends SemanticEvent = SemanticEvent> {
	abstract readonly conditionId: string
	abstract isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean

	and(other: Condition<TEvent>): Condition<TEvent> {
		return new AndRule(this, other)
	}

	or(other: Condition<TEvent>): Condition<TEvent> {
		return new OrRule(this, other)
	}

	not(): Condition<TEvent> {
		return new NotRule(this)
	}
}

class AndRule<TEvent extends SemanticEvent> extends Condition<TEvent> {
	readonly conditionId = "and"
	constructor(
		private readonly left: Condition<TEvent>,
		private readonly right: Condition<TEvent>,
	) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return this.left.isSatisfiedBy(situationContext) && this.right.isSatisfiedBy(situationContext)
	}
}

class OrRule<TEvent extends SemanticEvent> extends Condition<TEvent> {
	readonly conditionId = "or"
	constructor(
		private readonly left: Condition<TEvent>,
		private readonly right: Condition<TEvent>,
	) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return this.left.isSatisfiedBy(situationContext) || this.right.isSatisfiedBy(situationContext)
	}
}

class NotRule<TEvent extends SemanticEvent> extends Condition<TEvent> {
	readonly conditionId = "not"
	constructor(private readonly rule: Condition<TEvent>) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return !this.rule.isSatisfiedBy(situationContext)
	}
}
