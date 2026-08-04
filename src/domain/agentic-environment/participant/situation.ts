import { RuntimeState } from "../runtime-state"
import { SemanticEvent } from "../semantic-event/event"
import { Action } from "./action"
import { Interception } from "./interception"
import { Participant } from "./participant"
import { SituationSpecification } from "./situation-specification"

export interface Situation<TParams> {
	readonly specification: SituationSpecification
	readonly intercepttion: Interception<TParams>
	readonly action: Action<TParams>
}

export type SituationContext<TEvent extends SemanticEvent = SemanticEvent> = {
	readonly event: TEvent
	readonly participant: Participant
	readonly state: RuntimeState
}
