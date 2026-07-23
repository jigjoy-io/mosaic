import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { DecisionSpecification } from "./decision-specification"
import { Contract, EventProcessor, Memory } from "../agent/memory"

export class Behavior {
	private constructor(
		private readonly id: string,
		private decisionSpecification: DecisionSpecification,
		private eventProcessors: EventProcessor[],
	) {}

	getId(): string {
		return this.id
	}

	getDecisionSpecification(): DecisionSpecification {
		return this.decisionSpecification
	}

	getEventProcessors(): EventProcessor[] {
		return this.eventProcessors
	}

	async *execute(event: SemanticEvent, memory: Memory, contract: Contract): AsyncIterable<SemanticEvent> {
		const isSatisfied = this.decisionSpecification.isSatisfiedBy(event, memory, contract)

		if (!isSatisfied) {
			return
		}

		for (const eventProcessor of this.eventProcessors) {
			yield* eventProcessor.execute(event)
		}
	}

	static create({ when, then }: { when: DecisionSpecification; then: EventProcessor[] }): Behavior {
		const id = crypto.randomUUID()
		return new Behavior(id, when, then)
	}

	static rehydrate(
		id: string,
		decisionSpecification: DecisionSpecification,
		eventProcessors: EventProcessor[],
	): Behavior {
		return new Behavior(id, decisionSpecification, eventProcessors)
	}
}
