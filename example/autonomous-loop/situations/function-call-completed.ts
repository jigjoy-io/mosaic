import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { Situation, SituationContext } from "@domain/agentic-environment/participant/situation"
import { SituationSpecification } from "@domain/agentic-environment/participant/situation-specification"
import { inference, Interception } from "src"

export class FunctionCallCompleted extends SituationSpecification {
	readonly conditionId = "function.call.completed"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "functions.call.completed"
	}
}

export class FunctionCallCompletedInterception implements Interception<InferenceParams> {
	apply(context: SituationContext): InferenceParams {
		const { participant } = context
		return {
			model: "gpt-5.4",
			streaming: false,
			callerId: participant.id,
			context: participant.memory.getContext(),
		}
	}
}

export const functionCallCompleted: Situation<InferenceParams> = {
	specification: new FunctionCallCompleted(),
	intercepttion: new FunctionCallCompletedInterception(),
	action: inference,
}
