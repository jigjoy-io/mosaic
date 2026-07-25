import { Constraint } from "@domain/agentic-environment/situation/constraint"
import { resolveRuntime } from "./runtime"
import { Situation } from "@domain/agentic-environment/situation/situation"

export class FreemiumAvailable extends Constraint {
	private readonly runtime = resolveRuntime()
	isSatisfiedBy(situation: Situation): boolean {
		const { event } = situation
		const { freemiumAccount } = this.runtime.state

		if (event.getType() !== "participant_message") {
			return false
		}

		return freemiumAccount.getNumberOfTry() < freemiumAccount.getMaxNumberOfTry()
	}
}
