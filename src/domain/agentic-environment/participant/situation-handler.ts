import { RuntimeState } from "../runtime-state"
import { SemanticEvent } from "../semantic-event/event"
import { Participant } from "./participant"
import { SituationSpecification } from "./situation-specification"

export interface SituationHandler {
	readonly specification: SituationSpecification
	readonly processor: SituationProcessor
}

export type SituationContext<TEvent extends SemanticEvent = SemanticEvent> = {
	readonly event: TEvent
	readonly participant: Participant
	readonly state: RuntimeState
}

export interface SituationProcessor {
	id: string
	name: string
	apply(context: SituationContext): AsyncIterable<SemanticEvent>
}
