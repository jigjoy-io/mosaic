import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Constraint } from "./specification"
import { SituationProcessor } from "../agent/memory"
import { Situation } from "./situation"

export class Behavior {
	private constructor(
		private readonly id: string,
		private constraint: Constraint,
		private situationProcessors: SituationProcessor[],
	) {}

	getId(): string {
		return this.id
	}

	getConstraint(): Constraint {
		return this.constraint
	}

	getSituationProcessors(): SituationProcessor[] {
		return this.situationProcessors
	}

	async *execute(situation: Situation): AsyncIterable<SemanticEvent> {
		const isSatisfied = this.constraint.isSatisfiedBy(situation)

		if (!isSatisfied) {
			return
		}

		for (const situationProcessor of this.situationProcessors) {
			yield* situationProcessor.process(situation)
		}
	}

	static create({ when, then }: { when: Constraint; then: SituationProcessor[] }): Behavior {
		const id = crypto.randomUUID()
		return new Behavior(id, when, then)
	}

	static rehydrate(id: string, constraint: Constraint, situationProcessors: SituationProcessor[]): Behavior {
		return new Behavior(id, constraint, situationProcessors)
	}
}
