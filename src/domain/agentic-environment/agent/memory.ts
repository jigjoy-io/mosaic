import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Action } from "../behavior/action"

export class WorkingMemory {}

export interface ContextProjection<TParams> {
	project(event: SemanticEvent, memory: WorkingMemory): TParams
}

export interface BoundAction {
	execute(event: SemanticEvent, memory: WorkingMemory): AsyncIterable<SemanticEvent>
}

export class ActionBinding<TParams> implements BoundAction {
	constructor(
		private readonly action: Action<TParams>,
		private readonly contextProjection: ContextProjection<TParams>,
	) {}

	async *execute(event: SemanticEvent, memory: WorkingMemory): AsyncIterable<SemanticEvent> {
		const result = this.action.execute(this.contextProjection.project(event, memory))
		for await (const event of result) {
			yield event
		}
	}
}

export type FunctionCallParams = {
	signal?: AbortSignal
}
