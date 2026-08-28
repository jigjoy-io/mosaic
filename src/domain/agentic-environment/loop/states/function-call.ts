import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { LoopState, LoopStateExecution } from "../loop-state"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { InferenceInput } from "./inference"
import { Tool } from "@domain/generative-model/tool"

export interface FunctionCallRunner {
	run(call: FunctionCallItem, tool: Tool): Promise<FunctionCallOutputItem>
}

export interface FunctionCallParams {
	call: FunctionCallItem
	inferenceInput: InferenceInput
}

export class FunctionCallState implements LoopState<"function_call"> {
	readonly id = "function_call"

	constructor(private readonly functionCallRunner: FunctionCallRunner) {}

	async run(input: FunctionCallParams): Promise<LoopStateExecution<"function_call">> {
		const { call, inferenceInput } = input
		let tool: Tool | undefined = inferenceInput.tools?.find((tool) => tool.name === call.name)

		if (!tool)
			return {
				stateId: this.id,
				input,
				output: { item: FunctionCallOutputItem.create(call.callId, `Unknown tool: ${call.name}`) },
			}

		const item = await this.functionCallRunner.run(call, tool)

		return {
			stateId: this.id,
			input,
			output: {
				item,
			},
		}
	}
}
