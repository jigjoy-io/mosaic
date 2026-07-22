import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ParticipantManifest } from "./participant-manifest"
import { WorkingMemory } from "./agent/memory"
import { Behavior } from "./behavior/behavior"

export class Participant {
	protected constructor(
		readonly id: string,
		readonly manifest: ParticipantManifest,
		readonly behaviors: readonly Behavior[],
		readonly workingMemory: WorkingMemory,
	) {}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	async *process(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		for (const behavior of this.behaviors) {
			yield* behavior.execute(event, this.workingMemory)
		}
	}

	getId(): string {
		return this.id
	}

	static create({
		manifest,
		behaviors,
		workingMemory,
	}: {
		manifest: ParticipantManifest
		behaviors: readonly Behavior[]
		workingMemory: WorkingMemory
	}): Participant {
		const id = crypto.randomUUID()
		return new Participant(id, manifest, behaviors, workingMemory)
	}

	static rehydrate({
		id,
		manifest,
		behaviors,
		workingMemory,
	}: {
		id: string
		manifest: ParticipantManifest
		behaviors: readonly Behavior[]
		workingMemory: WorkingMemory
	}): Participant {
		return new Participant(id, manifest, behaviors, workingMemory)
	}
}
