import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgentManifest, ParticipantManifest } from "./participant-manifest"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"

export abstract class Participant<T> {
	readonly manifest: ParticipantManifest<T>

	constructor(manifest: ParticipantManifest<T>) {
		this.manifest = manifest
	}

	getManifest(): ParticipantManifest<T> {
		return this.manifest
	}

	abstract process(event: SemanticEvent<unknown>): void
}

export abstract class Agent extends Participant<AgentManifest> {
	constructor(
		readonly context: ModelContext,
		manifest: ParticipantManifest<AgentManifest>,
	) {
		super(manifest)
	}

	process(event: SemanticEvent<unknown>): void {
		const data = event.getData() as { role: string; message: string }
		if (event.type === "message" && data.role === "participant") {
			const message = `Participant ${this.manifest.getName()} sent a message: ${data.message}`
			this.context.addContextItem(UserMessageItem.create(message))
		}

		this.onEvent(event)
	}

	abstract onEvent(event: SemanticEvent<unknown>): void
}
