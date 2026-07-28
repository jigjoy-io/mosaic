import type { Tool } from "@domain/generative-model/tool"
import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { Action } from "@domain/agentic-environment/participant/process/process"

export type FunctionCallParams = {
	readonly call: FunctionCallItem
	readonly tool: Tool
	readonly signal?: AbortSignal
}

export class FunctionCall implements Action<FunctionCallParams> {
	id: string = "function.call"

	async *run(input: FunctionCallParams): AsyncIterable<SemanticEvent> {
		const { call, tool, signal } = input
		if (signal?.aborted) {
			return
		}

		if (!tool) throw new Error(`Unknown tool: ${call.name}`)

		const result = await tool.invoke(JSON.parse(call.args))
		yield {
			type: "function.call.completed",
			producerId: call.callId,
			occurredAt: new Date(),
			payload: {
				functionId: call.callId,
				result: JSON.stringify(result),
			},
		}
	}
}
