import { SemanticEvent } from "../semantic-event/event"

export interface Action<TParams> {
	readonly actionId: string

	run(params: TParams): AsyncIterable<SemanticEvent>
}
