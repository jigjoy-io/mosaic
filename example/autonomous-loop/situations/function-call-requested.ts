import { FunctionCallParams } from "@app/services/function-call"
import { Situation, SituationContext } from "@domain/agentic-environment/participant/situation"
import { SituationSpecification } from "@domain/agentic-environment/participant/situation-specification"
import { functionCall, Interception } from "src"

export class FunctionCallRequested extends SituationSpecification {
	readonly conditionId = "function.call.requested"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "functions.call.requested"
	}
}

export class FunctionCallRequestedInterception implements Interception<FunctionCallParams> {
	apply(context: SituationContext): FunctionCallParams {
		const { event, participant } = context
		const { call, tool } = event.payload as FunctionCallParams
		return {
			call,
			tool,
			callerId: participant.id,
		}
	}
}

export const functionCallRequested: Situation<FunctionCallParams> = {
	specification: new FunctionCallRequested(),
	intercepttion: new FunctionCallRequestedInterception(),
	action: functionCall,
}
