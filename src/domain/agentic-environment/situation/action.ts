import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Situation } from "./situation"

export interface Action {
	process(situation: Situation): AsyncIterable<SemanticEvent>
}
