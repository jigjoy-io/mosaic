import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { Participant } from "./participant"
import { Condition } from "./condition"
import { Interception } from "./interception"

export class Process {
	constructor(
		private readonly processId: string,
		private readonly processName: string,
		private actions: Action<unknown>[],
		private rules: Rule<unknown>[],
	) {}

	getActions(): Action<unknown>[] {
		return this.actions
	}

	getRules(): Rule<unknown>[] {
		return this.rules
	}

	getProcessId(): string {
		return this.processId
	}

	getProcessName(): string {
		return this.processName
	}

	static create({
		processName,
		actions,
		rules,
	}: {
		processName: string
		actions: Action<unknown>[]
		rules: Rule<unknown>[]
	}): Process {
		const processId = crypto.randomUUID()
		return new Process(processId, processName, actions, rules)
	}
}

export interface Action<TParams> {
	readonly actionId: string

	run(params: TParams): AsyncIterable<SemanticEvent>
}

export interface Rule<TParams> {
	readonly condition: Condition
	readonly resolve: (context: SituationContext) => TParams
	readonly action: Action<TParams>
}

export type SituationContext<TEvent extends SemanticEvent = SemanticEvent> = {
	readonly event: TEvent
	readonly participant: Participant
	readonly state: RuntimeState
}
