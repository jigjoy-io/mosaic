import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ParticipantManifest } from "./participant-manifest"
import { Memory } from "./agent/memory"
import { EventProcessor } from "./behavior/event-processor"

export class Participant {
	protected constructor(
		readonly id: string,
		readonly manifest: ParticipantManifest,
		readonly eventProcessors: readonly EventProcessor[],
		readonly memory: Memory,
	) {}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	async *process(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		for (const eventProcessor of this.eventProcessors) {
			yield* eventProcessor.reactTo(event)
		}
	}

	getId(): string {
		return this.id
	}
}
