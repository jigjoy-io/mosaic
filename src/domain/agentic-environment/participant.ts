import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ParticipantManifest } from "./participant-manifest"
import { Contract, Memory } from "./agent/memory"
import { Behavior } from "./behavior/behavior"

export class Participant {
	protected constructor(
		readonly id: string,
		readonly manifest: ParticipantManifest,
		readonly behaviors: readonly Behavior[],
		readonly memory: Memory,
		readonly contract: Contract,
	) {}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	async *process(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		for (const behavior of this.behaviors) {
			yield* behavior.execute(event, this.memory, this.contract)
		}
	}

	getId(): string {
		return this.id
	}
}
