import { Situation } from "@domain/agentic-environment/participant/situation"
import { Interception } from "@domain/agentic-environment/participant/interception"
import { SituationContext } from "@domain/agentic-environment/participant/situation"
import { inferenceCompleted, sendMessage } from "src"
import { InferenceCompletedParams } from "@app/services/inference"

export class PrepareInferenceRequest implements Interception<InferenceCompletedParams> {
	id: string = "prepare-inference-request"
	name: string = "Prepare Inference Request"

	apply(context: SituationContext): InferenceCompletedParams {
		const { participant, event } = context
		const { answer } = event.payload as { answer: string }
		return {
			answer: answer,
			producerId: participant.id,
		}
	}
}

export const inferenceCompletedSituation: Situation<InferenceCompletedParams> = {
	specification: inferenceCompleted,
	intercepttion: new PrepareInferenceRequest(),
	action: sendMessage,
}
