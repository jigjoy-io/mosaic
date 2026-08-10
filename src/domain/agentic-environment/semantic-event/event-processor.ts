import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { Participant } from "../participant/participant"
import { RuntimeState } from "../runtime-state"

export class EventProcessor {
	async *process(event: SemanticEvent, consumer: Participant, state: RuntimeState): AsyncIterable<SemanticEvent> {
		for (const handler of consumer.getHandlers()) {
			const isSatisfied = handler.specification.isSatisfiedBy({
				event,
				participant: consumer,
				runtimeState: state,
			})
			if (isSatisfied) {
				yield* handler.processor.apply({ event, participant: consumer, state })
			}
		}
	}
}
