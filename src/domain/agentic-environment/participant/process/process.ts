import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { Condition } from "./condition"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { Participant } from "../participant"

export type Process = {
	readonly processId: string
	readonly rules: readonly Rule<unknown>[]
}

export interface ProcessInstance {
	readonly id: string
	readonly ruleBookId: string
	readonly participantIds: readonly string[]
	readonly currentActionId: string
}

export type SituationContext = {
	readonly event: SemanticEvent<string, unknown>
	readonly participant: Participant
	readonly state?: RuntimeState
}

export type Rule<TInput> = {
	readonly condition: Condition
	readonly resolveInput: (context: SituationContext) => TInput
	readonly action: Action<TInput>
}

export interface Action<TInput> {
	readonly id: string
	run(input: TInput): AsyncIterable<SemanticEvent>
}
