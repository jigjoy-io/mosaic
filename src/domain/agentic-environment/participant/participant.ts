import { SemanticEvent } from "../semantic-event/event"
import { SituationHandler } from "./situation-handler"

export type ParticipantRole = "agent" | "human"

export type ParticipantManifest = {
	readonly id: string
	readonly name: string
	readonly role: ParticipantRole
	readonly capabilities?: readonly string[]
}

export abstract class Participant {
	readonly manifest: ParticipantManifest
	private handlers: SituationHandler[]

	protected constructor(manifest: ParticipantManifest, handlers: SituationHandler[]) {
		this.manifest = manifest
		this.handlers = handlers
	}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	getHandlers(): SituationHandler[] {
		return this.handlers
	}
}
