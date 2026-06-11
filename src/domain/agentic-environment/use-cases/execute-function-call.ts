import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import type { AgenticEnvironment } from "../agentic-environment"
import type { Participant } from "../participant"
import type { Tool } from "@domain/generative-model/tool"

export interface ExecuteFunctionCallUseCase {
	execute(
		environment: AgenticEnvironment,
		functionCallItem: FunctionCallItem,
		tool: Tool,
		caller: Participant,
		signal?: AbortSignal,
	): Promise<void>
}
