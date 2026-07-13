import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgentManifest, ParticipantManifest } from "./participant-manifest"
import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"

export abstract class Participant {
	readonly manifest: ParticipantManifest
	private readonly decisionPolicy: DecisionPolicy<SemanticEvent>
	private readonly perceptionRules: Map<Function, PerceptionRule>

	constructor(
		manifest: ParticipantManifest,
		perceptionRules: Map<Function, PerceptionRule>,
		decisionPolicy: DecisionPolicy<SemanticEvent>,
	) {
		this.perceptionRules = perceptionRules
		this.decisionPolicy = decisionPolicy
		this.manifest = manifest
	}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	abstract process(event: SemanticEvent): void

	registerPerceptionRule(eventType: new (...args: any[]) => SemanticEvent, rule: PerceptionRule): void {
		this.perceptionRules.set(eventType, rule)
	}

	perceive(event: SemanticEvent, participant: Participant): Perception {
		const rule = this.perceptionRules.get(event.constructor)

		return (
			rule?.perceive(event, participant) ?? {
				contextItems: [],
			}
		)
	}
}

export abstract class Agent extends Participant {
	constructor(
		readonly context: ModelContext,
		manifest: AgentManifest,
		perceptionRules: Map<Function, PerceptionRule>,
		decisionPolicy: DecisionPolicy<SemanticEvent>,
	) {
		super(manifest, perceptionRules, decisionPolicy)
	}

	process(event: SemanticEvent): void {
		this.onEvent(event)
	}

	abstract onEvent(event: SemanticEvent): void
}

interface PerceptionRule {
	perceive(event: SemanticEvent, participant: Participant): Perception
}

type Perception = {
	contextItems: ContextItem[]
}

export interface ContextProjection {
	project(event: SemanticEvent): ContextItem[]
}

export abstract class Reaction {
	abstract execute(): void | Promise<void>
}

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

export class DecisionRule<T> {
	constructor(
		public readonly reason: string,
		private readonly decisionSpecification: DecisionSpecification<T>,
		private readonly reactionFactory: (candidate: T) => Reaction[],
	) {}

	matches(candidate: T): boolean {
		return this.decisionSpecification.isSatisfiedBy(candidate)
	}

	decide(candidate: T): Reaction[] {
		return this.reactionFactory(candidate)
	}
}

export interface DecisionPolicy<T> {
	decide(candidate: T): DecisionRecord
}

type DecisionRecord = {
	reactions: Reaction[]
	reason?: string
}

export class FirstMatchDecisionPolicy<T> implements DecisionPolicy<T> {
	constructor(private readonly rules: readonly DecisionRule<T>[]) {}

	decide(candidate: T): DecisionRecord {
		const rule = this.rules.find((rule) => rule.matches(candidate))

		return {
			reactions: rule?.decide(candidate) ?? [],
			reason: rule?.reason,
		}
	}
}
