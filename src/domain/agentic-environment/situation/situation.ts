import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "../participant/participant"

export class Situation {
	consumer: Participant
	event: SemanticEvent

	constructor(consumer: Participant, event: SemanticEvent) {
		this.consumer = consumer
		this.event = event
	}
}
