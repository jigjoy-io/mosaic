import { Constraint } from "@domain/agentic-environment/participant/behavior/constraint"
import { resolveRuntime } from "../runtime"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "@domain/agentic-environment/participant/participant"

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
