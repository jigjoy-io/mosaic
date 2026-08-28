import { LoopState, LoopStateExecution, ModelMessageParams } from "../loop-state"

export class ModelMessageState implements LoopState<"model_message"> {
	readonly id = "model_message"

	async run(input: ModelMessageParams): Promise<LoopStateExecution<"model_message">> {
		// Publish the message, persist it or emit a semantic event.
		console.log(input.message.content)

		return {
			stateId: this.id,
			input,
			output: undefined,
		}
	}
}
