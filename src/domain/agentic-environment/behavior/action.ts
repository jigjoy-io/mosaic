import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export interface Action {
	process(event: SemanticEvent): AsyncIterable<SemanticEvent>
}
