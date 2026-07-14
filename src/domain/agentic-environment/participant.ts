import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgentManifest, ParticipantManifest } from "./participant-manifest"
import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { DecisionPolicy } from "./decision/policy"

export abstract class Participant {
	readonly manifest: ParticipantManifest
	private readonly decisionPolicy: DecisionPolicy<SemanticEvent>
	private readonly perceptionRules: Map<Function, PerceptionRule>

	constructor(
		manifest: ParticipantManifest,
		decisionPolicy: DecisionPolicy<SemanticEvent>,
		perceptionRules: Map<Function, PerceptionRule>,
	) {
		this.decisionPolicy = decisionPolicy
		this.manifest = manifest
		this.perceptionRules = perceptionRules
	}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	registerPerceptionRule(eventType: new (...args: any[]) => SemanticEvent, rule: PerceptionRule): void {
		this.perceptionRules.set(eventType, rule)
	}

	perceive(event: SemanticEvent): Perception {
		const rule = this.perceptionRules.get(event.constructor)

		return (
			rule?.perceive(event, this) ?? {
				contextItems: [],
			}
		)
	}

	async *process(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		const record = this.decisionPolicy.decide(event)
		const perception = this.perceive(event)

		for (const reaction of record.reactions) {
			yield* reaction.execute(perception)
		}
	}
}

export abstract class Agent extends Participant {
	constructor(
		readonly context: ModelContext,
		manifest: AgentManifest,
		decisionPolicy: DecisionPolicy<SemanticEvent>,
		perceptionRules: Map<Function, PerceptionRule>,
	) {
		super(manifest, decisionPolicy, perceptionRules)
	}
}

interface PerceptionRule {
	perceive(event: SemanticEvent, participant: Participant): Perception
}

type Perception = {
	contextItems: ContextItem[]
}

export interface ContextProjection {
	project(event: SemanticEvent): Perception
}

export abstract class Reaction<T> {
	abstract execute(input: T): AsyncIterable<SemanticEvent>
}
