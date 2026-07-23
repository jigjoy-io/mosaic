import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Action } from "../behavior/action"

export class Memory {}

export interface EventMapper<TParams> {
	map(event: SemanticEvent): TParams
}

export interface EventProcessor {
	execute(event: SemanticEvent): AsyncIterable<SemanticEvent>
}

export class EventProcessing<TParams> implements EventProcessor {
	constructor(
		private readonly eventMapper: EventMapper<TParams>,
		private readonly action: Action<TParams>,
	) {}

	async *execute(event: SemanticEvent): AsyncIterable<SemanticEvent> {
		const params = this.eventMapper.map(event)
		const result = this.action.execute(params)

		yield* result
	}
}

export type FunctionCallParams = {
	signal?: AbortSignal
}
