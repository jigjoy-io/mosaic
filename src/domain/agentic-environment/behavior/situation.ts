import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "../participant"
import { RuntimeState } from "../runtime-state"

export interface Situation {
	readonly event: SemanticEvent
	readonly participant: Participant
	readonly runtimeState: RuntimeState
}
