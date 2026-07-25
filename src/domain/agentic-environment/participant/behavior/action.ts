import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "../participant"

export interface Action {
	process(event: SemanticEvent, consumer: Participant): AsyncIterable<SemanticEvent>
}
