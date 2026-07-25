import { Constraint } from "@domain/agentic-environment/behavior/constraint"
import { resolveRuntime } from "./runtime"
import { SemanticEvent } from "src"

export class FreemiumAvailable extends Constraint {
	private readonly runtime = resolveRuntime()
	isSatisfiedBy(event: SemanticEvent): boolean {
		const { freemiumAccount } = this.runtime.state

		if (event.getType() !== "participant_message") {
			return false
		}

		return freemiumAccount.getNumberOfTry() < freemiumAccount.getMaxNumberOfTry()
	}
}
