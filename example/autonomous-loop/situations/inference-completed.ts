import { Situation } from "@domain/agentic-environment/participant/situation"
import { SendMessage } from "../../../src/application/services/send-message"
import { Interception } from "@domain/agentic-environment/participant/interception"
import { SituationContext } from "@domain/agentic-environment/participant/situation"
import { SituationSpecification } from "@domain/agentic-environment/participant/situation-specification"

export class InferenceCompleted extends SituationSpecification {
	readonly conditionId = "inference.completed"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "inference.completed"
	}
}

export class InferenceCompletedInterception implements Interception<{ answer: string; producerId: string }> {
	apply(context: SituationContext): { answer: string; producerId: string } {
		const { participant, event } = context
		const { answer } = event.payload as { answer: string }
		return {
			answer: answer,
			producerId: participant.id,
		}
	}
}

export const inferenceCompleted: Situation<{ answer: string; producerId: string }> = {
	specification: new InferenceCompleted(),
	intercepttion: new InferenceCompletedInterception(),
	action: new SendMessage(),
}
