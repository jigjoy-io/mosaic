import { LoopState, LoopStateExecution, ModelMessageParams } from "@domain/agentic-environment/loop/loop-state"
import { LoopVisitor } from "@domain/agentic-environment/loop/loop-visitor"

export class ModelMessageState implements LoopState<ModelMessageParams, LoopStateExecution<"model_message">> {
	readonly id = "model_message"

	async run(input: ModelMessageParams, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"model_message">> {
		console.log(input.message.content)
		return {
			stateId: this.id,
			input,
			output: undefined,
		}
	}
}
