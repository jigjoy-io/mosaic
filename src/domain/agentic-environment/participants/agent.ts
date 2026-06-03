import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { Participant } from "@domain/agentic-environment/participants/participant"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"

export abstract class Agent extends Participant {
	abstract executeFunctionCall(
		environment: AgenticEnvironment,
		functionCallItem: FunctionCallItem,
		signal?: AbortSignal,
	): Promise<void>

}
