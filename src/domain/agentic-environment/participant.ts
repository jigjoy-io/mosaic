import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ParticipantManifest } from "./participant-manifest"
import { Behavior } from "./behavior"
import { WorkingMemory } from "./working-memory"

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
