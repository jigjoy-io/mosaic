import { Tool } from "@domain/generative-model/tool"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"

export class FunctionCallRunner {

	async *run(call: FunctionCallItem, tool: Tool, signal?: AbortSignal): AsyncIterable<FunctionCallOutputItem> {

		if(signal?.aborted) {
			return
		}

		if (!tool) throw new Error(`Unknown tool: ${call.name}`)

		const result = await tool.invoke(JSON.parse(call.args))
		yield FunctionCallOutputItem.create(call.callId, JSON.stringify(result))
	}
}
