import { InferenceInput } from "@domain/agentic-environment/loop/states/inference"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { LoopState, LoopStateExecution, ReceivedMessage } from "../loop-state"

export class MessageReceivedState implements LoopState<"message_received"> {
	readonly id = "message_received"

	async run(input: ReceivedMessage): Promise<LoopStateExecution<"message_received">> {
		const userMessage = UserMessageItem.create(input.content)

		const output: InferenceInput = {
			...input.input,
			context: input.input.context.addContextItems([userMessage]),
		}

		return {
			stateId: this.id,
			input,
			output,
		}
	}
}
