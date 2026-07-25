import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "../participant/participant"

export class EventProcessor {
	async *process(event: SemanticEvent, consumer: Participant): AsyncIterable<SemanticEvent> {
		for (const behavior of consumer.behaviors) {
			const isSatisfied = behavior.getConstraint().isSatisfiedBy(event, consumer)
			if (isSatisfied) {
				for (const action of behavior.getActions()) {
					yield* action.process(event, consumer)
				}
			}
		}
	}
}
