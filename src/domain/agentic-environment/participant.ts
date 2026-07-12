import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgentManifest, ParticipantManifest } from "./participant-manifest"
import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"

export abstract class Participant {
	readonly manifest: ParticipantManifest
	private readonly reactionPolicy: ReactionPolicy<SemanticEvent>

	constructor(manifest: ParticipantManifest, reactionPolicy: ReactionPolicy<SemanticEvent>) {
		this.reactionPolicy = reactionPolicy
		this.manifest = manifest
	}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	abstract process(event: SemanticEvent): void

	private readonly perceptionRules = new Map<Function, PerceptionRule>()

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
		reactionPolicy: ReactionPolicy<SemanticEvent>,
	) {
		super(manifest, reactionPolicy)
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

interface Specification<T> {
	isSatisfiedBy(candidate: T): boolean
}

class AndSpecification<T> implements Specification<T> {
	constructor(
		private readonly left: Specification<T>,
		private readonly right: Specification<T>,
	) {}

	isSatisfiedBy(candidate: T): boolean {
		return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
	}
}

export abstract class Reaction {
	protected constructor() {}
}

export class ActivateInference extends Reaction {
	constructor() {
		super()
	}
}

export class StopExecutionReaction extends Reaction {
	constructor(
		public readonly executionId: string,
		public readonly reason?: string,
	) {
		super()
	}
}

export class DeferredReaction extends Reaction {
	constructor(
		public readonly reaction: Reaction,
		public readonly executeAt: Date,
	) {
		super()
	}
}
// domain/reaction/ReactionSpecification.ts

export abstract class ReactionSpecification<T> {
	abstract isSatisfiedBy(candidate: T): boolean

	and(other: ReactionSpecification<T>): ReactionSpecification<T> {
		return new AndReactionSpecification(this, other)
	}

	or(other: ReactionSpecification<T>): ReactionSpecification<T> {
		return new OrReactionSpecification(this, other)
	}

	not(): ReactionSpecification<T> {
		return new NotReactionSpecification(this)
	}
}

class AndReactionSpecification<T> extends ReactionSpecification<T> {
	constructor(
		private readonly left: ReactionSpecification<T>,
		private readonly right: ReactionSpecification<T>,
	) {
		super()
	}

	isSatisfiedBy(candidate: T): boolean {
		return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
	}
}

class OrReactionSpecification<T> extends ReactionSpecification<T> {
	constructor(
		private readonly left: ReactionSpecification<T>,
		private readonly right: ReactionSpecification<T>,
	) {
		super()
	}

	isSatisfiedBy(candidate: T): boolean {
		return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
	}
}

class NotReactionSpecification<T> extends ReactionSpecification<T> {
	constructor(private readonly specification: ReactionSpecification<T>) {
		super()
	}

	isSatisfiedBy(candidate: T): boolean {
		return !this.specification.isSatisfiedBy(candidate)
	}
}

export class ReactionRule<T> {
	constructor(
		public readonly reason: string,
		private readonly specification: ReactionSpecification<T>,
		private readonly reactionFactory: (candidate: T) => Reaction[],
	) {}

	matches(candidate: T): boolean {
		return this.specification.isSatisfiedBy(candidate)
	}

	decide(candidate: T): Reaction[] {
		return this.reactionFactory(candidate)
	}
}

export interface ReactionPolicy<T> {
	decide(candidate: T): ReactionDecision
}

type ReactionDecision = {
	reactions: Reaction[]
	reason?: string
}

export class FirstMatchReactionPolicy<T> implements ReactionPolicy<T> {
	constructor(private readonly rules: readonly ReactionRule<T>[]) {}

	decide(candidate: T): ReactionDecision {
		const rule = this.rules.find((rule) => rule.matches(candidate))

		return {
			reactions: rule?.decide(candidate) ?? [],
			reason: rule?.reason,
		}
	}
}
