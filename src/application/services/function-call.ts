import type { Tool } from "@domain/generative-model/tool"
import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { FunctionCallRunner } from "@domain/agentic-environment/function-call-runner"

export type FunctionCallParams = {
	readonly call: FunctionCallItem
	readonly tool: Tool
	readonly signal?: AbortSignal
	readonly callerId: string
}

export type FunctionCallOutputParams = {
	readonly callId: string
	readonly message: string
}

export class DefaultFunctionCallRunner implements FunctionCallRunner {
	async run(input: FunctionCallParams): Promise<FunctionCallOutputParams> {
		const { call, tool } = input

		if (!tool)
			return {
				callId: call.callId,
				message: `Unknown tool: ${call.name}`,
			}

		try {
			const result = await tool.invoke(JSON.parse(call.args))
			return {
				callId: call.callId,
				message: JSON.stringify(result),
			}
		} catch (error) {
			return {
				callId: call.callId,
				message: `Error calling tool: ${error}`,
			}
		}
	}
}
