import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export abstract class Action<TParams> {
	abstract execute(params: TParams): AsyncIterable<SemanticEvent>
}
