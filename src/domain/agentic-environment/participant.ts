import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ParticipantManifest } from "./participant-manifest"
import { Memory } from "./agent/memory"
import { Behavior } from "./behavior/behavior"
import { RuntimeState } from "./runtime-state"

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

	async *process(event: SemanticEvent, runtimeState: RuntimeState): AsyncIterable<SemanticEvent> {
		for (const behavior of this.behaviors) {
			yield* behavior.execute({ event, participant: this, runtimeState })
		}
	}

	getId(): string {
		return this.id
	}
}
