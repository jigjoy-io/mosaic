import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ParticipantManifest } from "./participant-manifest"
import { Memory } from "./agent/memory"
import { Behavior } from "./behavior/behavior"

export class Participant {
	protected constructor(
		readonly id: string,
		readonly manifest: ParticipantManifest,
		readonly behaviors: readonly Behavior[],
		readonly memory: Memory,
	) {}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	async *process(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		for (const behavior of this.behaviors) {
			yield* behavior.execute(event, this.memory)
		}
	}

	getId(): string {
		return this.id
	}

	static create({
		manifest,
		behaviors,
		memory,
	}: {
		manifest: ParticipantManifest
		behaviors: readonly Behavior[]
		memory: Memory
	}): Participant {
		const id = crypto.randomUUID()
		return new Participant(id, manifest, behaviors, memory)
	}

	static rehydrate({
		id,
		manifest,
		behaviors,
		memory,
	}: {
		id: string
		manifest: ParticipantManifest
		behaviors: readonly Behavior[]
		memory: Memory
	}): Participant {
		return new Participant(id, manifest, behaviors, memory)
	}
}
