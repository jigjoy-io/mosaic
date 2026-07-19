import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { Behavior } from "../behavior/behavior"
import { WorkingMemory } from "./memory"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class Agent extends Participant {
	private readonly behaviors: readonly Behavior[]
	private readonly workingMemory: WorkingMemory

	constructor(manifest: AgentManifest, behaviors: readonly Behavior[], workingMemory: WorkingMemory) {
		super(manifest)
		this.behaviors = behaviors
		this.workingMemory = workingMemory
	}

	async *process(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		for (const behavior of this.behaviors) {
			yield* behavior.execute(event, this.workingMemory)
		}
	}
}
