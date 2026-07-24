import { Constraint } from "@domain/agentic-environment/behavior/specification"
import { FreemiumSituation } from "./freemium-situation"

export class ParticipantSentMessage extends Constraint {
	isSatisfiedBy(situation: FreemiumSituation): boolean {
		const { event } = situation
		return event.getType() === "participant_message"
	}
}

export class FreemiumAvailable extends Constraint {
	isSatisfiedBy(situation: FreemiumSituation): boolean {
		const { runtimeState } = situation
		return runtimeState.freemiumAccount.getNumberOfTry() < runtimeState.freemiumAccount.getMaxNumberOfTry()
	}
}
