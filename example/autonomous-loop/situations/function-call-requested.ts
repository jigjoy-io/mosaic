import { FunctionCallParams } from "@app/services/function-call"
import { Situation, SituationContext } from "@domain/agentic-environment/participant/situation"
import { functionCall, functionCallRequested, FunctionCallItem, Interception } from "src"

export class FunctionCallRequestedInterception implements Interception<FunctionCallParams> {
	id: string = "function-call-requested"
	name: string = "Function Call Requested"

	apply(context: SituationContext): FunctionCallParams {
		const { event, participant } = context
		const { call, tool } = event.payload as FunctionCallParams
		participant.memory.getContext().addItem(FunctionCallItem.rehydrate(call))
		return {
			call,
			tool,
			callerId: participant.id,
		}
	}
}

export const functionCallRequestedSituation: Situation<FunctionCallParams> = {
	specification: functionCallRequested,
	intercepttion: new FunctionCallRequestedInterception(),
	action: functionCall,
}
