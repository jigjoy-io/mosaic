import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export interface Action<TParams> {
	execute(params: TParams): AsyncIterable<SemanticEvent>
}
