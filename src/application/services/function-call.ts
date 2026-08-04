import type { Tool } from "@domain/generative-model/tool"
import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { Action } from "@domain/agentic-environment/participant/action"

export type FunctionCallParams = {
	readonly call: FunctionCallItem
	readonly tool: Tool
	readonly signal?: AbortSignal
	readonly callerId: string
}

export type FunctionCallOutputParams = {
	readonly callId: string
	readonly output: string
}

export class FunctionCall implements Action<FunctionCallParams> {
	readonly actionId: string = "function.call"

	async *run(input: FunctionCallParams): AsyncIterable<SemanticEvent> {
		const { call, tool, signal, callerId } = input
		if (signal?.aborted) {
			return
		}

		if (!tool) throw new Error(`Unknown tool: ${call.name}`)

		const result = await tool.invoke(JSON.parse(call.args))
		yield {
			type: "function.call.output",
			producerId: callerId,
			occurredAt: new Date(),
			payload: {
				functionId: call.callId,
				result: JSON.stringify(result),
			},
		}
	}
}
