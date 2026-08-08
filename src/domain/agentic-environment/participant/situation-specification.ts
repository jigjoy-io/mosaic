import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { RuntimeState } from "../runtime-state"
import { Participant } from "./participant"

export type SituationContext<TEvent extends SemanticEvent = SemanticEvent> = {
	readonly event: TEvent
	readonly participant: Participant
	readonly runtimeState: RuntimeState
}

export abstract class SituationSpecification<TEvent extends SemanticEvent = SemanticEvent> {
	abstract readonly conditionId: string
	abstract isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean

	and(other: SituationSpecification<TEvent>): SituationSpecification<TEvent> {
		return new AndSituationSpecification(this, other)
	}

	or(other: SituationSpecification<TEvent>): SituationSpecification<TEvent> {
		return new OrSituationSpecification(this, other)
	}

	not(): SituationSpecification<TEvent> {
		return new NotSituationSpecification(this)
	}
}

class AndSituationSpecification<TEvent extends SemanticEvent> extends SituationSpecification<TEvent> {
	readonly conditionId = "and"
	constructor(
		private readonly left: SituationSpecification<TEvent>,
		private readonly right: SituationSpecification<TEvent>,
	) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return this.left.isSatisfiedBy(situationContext) && this.right.isSatisfiedBy(situationContext)
	}
}

class OrSituationSpecification<TEvent extends SemanticEvent> extends SituationSpecification<TEvent> {
	readonly conditionId = "or"
	constructor(
		private readonly left: SituationSpecification<TEvent>,
		private readonly right: SituationSpecification<TEvent>,
	) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return this.left.isSatisfiedBy(situationContext) || this.right.isSatisfiedBy(situationContext)
	}
}

class NotSituationSpecification<TEvent extends SemanticEvent> extends SituationSpecification<TEvent> {
	readonly conditionId = "not"
	constructor(private readonly rule: SituationSpecification<TEvent>) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return !this.rule.isSatisfiedBy(situationContext)
	}
}
