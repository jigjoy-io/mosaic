import { Situation } from "@domain/agentic-environment/situation/situation"
import { Agent } from "@domain/agentic-environment/participant/agent"
import { ParticipantMessage } from "@domain/agentic-environment/events/participant-message"

export class FreemiumSituation extends Situation {
	event: ParticipantMessage
	constructor(consumer: Agent, event: ParticipantMessage) {
		super(consumer, event)
		this.event = event
	}
}
