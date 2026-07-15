import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgentManifest, ParticipantManifest } from "./participant-manifest"
import { ModelContext } from "@domain/model-context/model-context"
import { DecisionSpecification } from "./decision/specification"

export class WorkingMemory {}

export class Behavior {
	constructor(
		private readonly decisionSpecification: DecisionSpecification,
		private readonly reactions: readonly Reaction[],
	) {}

	async *execute(workingMemory: WorkingMemory): AsyncIterable<SemanticEvent> {
		const decision = this.decisionSpecification.isSatisfiedBy(workingMemory)

		if (!decision) {
			return
		}

		for (const reaction of this.reactions) {
			yield* reaction.execute(workingMemory)
		}
	}
}

export abstract class Participant {
	constructor(
		readonly manifest: ParticipantManifest,
		private readonly behaviors: readonly Behavior[],
	) {}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	protected abstract prepareWorkingMemory(event: SemanticEvent): WorkingMemory

	async *process(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		const workingMemory = this.prepareWorkingMemory(event)

		for (const behavior of this.behaviors) {
			yield* behavior.execute(workingMemory)
		}
	}
}

export abstract class Agent extends Participant {
	constructor(
		readonly context: ModelContext,
		manifest: AgentManifest,
		behaviors: readonly Behavior[],
	) {
		super(manifest, behaviors)
	}
}

export abstract class Reaction {
	abstract execute(workingMemory: WorkingMemory): AsyncIterable<SemanticEvent>
}
