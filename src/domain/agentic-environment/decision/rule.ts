import { Reaction } from "../participant"
import { DecisionSpecification } from "./specification"

export class DecisionRule<T> {
	constructor(
		public readonly reason: string,
		private readonly decisionSpecification: DecisionSpecification<T>,
		private readonly reactionFactory: (candidate: T) => Reaction<T>[],
	) {}

	matches(candidate: T): boolean {
		return this.decisionSpecification.isSatisfiedBy(candidate)
	}

	decide(candidate: T): Reaction<T>[] {
		return this.reactionFactory(candidate)
	}
}
