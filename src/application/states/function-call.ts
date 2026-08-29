import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { LoopState, LoopStateExecution } from "@domain/agentic-environment/loop/loop-state"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { InferenceInput } from "./inference"
import { Tool } from "@domain/generative-model/tool"
import { LoopVisitor } from "@domain/agentic-environment/loop/loop-visitor"

export interface FunctionCallRunner {
	run(call: FunctionCallItem, tool: Tool): Promise<FunctionCallOutputItem>
}

export interface FunctionCallParams {
	call: FunctionCallItem
	inferenceInput: InferenceInput
}

export class FunctionCallState implements LoopState<FunctionCallParams, LoopStateExecution<"function_call">> {
	readonly id = "function_call"

	constructor(private readonly functionCallRunner: FunctionCallRunner) {}

	async run(input: FunctionCallParams, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"function_call">> {
		loopVisitor.visitFunctionCallStarted(input)

		const { call, inferenceInput } = input

		let tool: Tool | undefined = inferenceInput.tools?.find((tool) => tool.name === call.name)

		if (!tool) {
			return {
				stateId: this.id,
				input,
				output: {
					item: FunctionCallOutputItem.create(call.callId, `Error: unknown tool "${call.name}"`),
				},
			}
		}

		const item = await this.functionCallRunner.run(call, tool)

		loopVisitor.visitFunctionCallCompleted(item)
		return {
			stateId: this.id,
			input,
			output: {
				item,
			},
		}
	}
}
