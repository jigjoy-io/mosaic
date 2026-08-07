import { FunctionCallOutputParams } from "@app/services/function-call"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { Situation, SituationContext } from "@domain/agentic-environment/participant/situation"
import { functionCallCompleted, FunctionCallOutputItem, inference, Interception } from "src"

export class FunctionCallCompletedInterception implements Interception<InferenceParams> {
	id: string = "function-call-completed"
	name: string = "Function Call Completed"

	apply(context: SituationContext): InferenceParams {
		const { event, participant } = context
		const functionOutput = event.payload as FunctionCallOutputParams
		participant.memory
			.getContext()
			.addItem(FunctionCallOutputItem.create(functionOutput.callId, functionOutput.output))
		return {
			model: "gpt-5.4",
			streaming: false,
			callerId: participant.id,
			context: participant.memory.getContext(),
		}
	}
}

export const functionCallCompletedSituation: Situation<InferenceParams> = {
	specification: functionCallCompleted,
	intercepttion: new FunctionCallCompletedInterception(),
	action: inference,
}
