import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgentManifest, ParticipantManifest } from "./participant-manifest"
import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { DecisionPolicy } from "./decision/policy"

export abstract class Participant {
	readonly manifest: ParticipantManifest
	private readonly decisionPolicy: DecisionPolicy<SemanticEvent>
	private readonly contextProjection: ContextProjection

	constructor(
		manifest: ParticipantManifest,
		decisionPolicy: DecisionPolicy<SemanticEvent>,
		contextProjection: ContextProjection,
	) {
		this.decisionPolicy = decisionPolicy
		this.manifest = manifest
		this.contextProjection = contextProjection
	}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	async *process(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		const record = this.decisionPolicy.decide(event)

		for (const reaction of record.reactions) {
			const perception = this.contextProjection.project(event)
			yield* reaction.execute(perception)
		}
	}
}

export abstract class Agent extends Participant {
	constructor(
		readonly context: ModelContext,
		manifest: AgentManifest,
		decisionPolicy: DecisionPolicy<SemanticEvent>,
		contextProjection: ContextProjection,
	) {
		super(manifest, decisionPolicy, contextProjection)
	}
}

type Perception = {
	contextItems: ContextItem[]
}

export interface ContextProjection {
	project(event: SemanticEvent): Perception
}

export abstract class Reaction {
	abstract execute(perception: Perception): AsyncIterable<SemanticEvent>
}
