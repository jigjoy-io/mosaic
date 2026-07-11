import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import type { Channel } from "../channel"
import type { Agent } from "../participant"
import type { Tool } from "@domain/generative-model/tool"

export interface ExecuteFunctionCallUseCase {
	execute(
		channel: Channel,
		functionCallItem: FunctionCallItem,
		tool: Tool,
		caller: Agent,
		signal?: AbortSignal,
	): Promise<void>
}
