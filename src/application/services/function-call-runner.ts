import { FunctionCallRunner } from "@domain/agentic-environment/runners/function-call-runner"
import { Tool } from "@domain/generative-model/tool"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"

export class DefaultFunctionCallRunner implements FunctionCallRunner {
	constructor(private readonly tools: Tool[]) {}

	async *run(call: FunctionCallItem, signal?: AbortSignal): AsyncIterable<FunctionCallOutputItem> {

		if(signal?.aborted) {
			return
		}

		const tool = this.tools.find((t) => t.name === call.name)
		if (!tool) throw new Error(`Unknown tool: ${call.name}`)

		const result = await tool.invoke(JSON.parse(call.args))
		yield FunctionCallOutputItem.create(call.callId, JSON.stringify(result))
	}
}
