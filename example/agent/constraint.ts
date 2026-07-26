import { resolveRuntime } from "example/runtime"
import { Constraint, Participant, SemanticEvent } from "src"

export class FreemiumAvailable extends Constraint {
	private readonly runtime = resolveRuntime()
	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		const { freemiumAccount } = this.runtime.state

		if (event.getType() !== "participant_message") {
			return false
		}

		return freemiumAccount.getNumberOfTry() < freemiumAccount.getMaxNumberOfTry()
	}
}
