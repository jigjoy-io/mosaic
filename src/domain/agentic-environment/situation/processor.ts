import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "../participant/participant"
import { Situation } from "./situation"

export class SituationProcessor {
	async *process(event: SemanticEvent, consumer: Participant): AsyncIterable<SemanticEvent> {
		const situation = new Situation(consumer, event)
		for (const behavior of consumer.behaviors) {
			const isSatisfied = behavior.getConstraint().isSatisfiedBy(situation)
			if (isSatisfied) {
				for (const action of behavior.getActions()) {
					yield* action.process(situation)
				}
			}
		}
	}
}
