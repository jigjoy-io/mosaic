import { InferenceInput } from "@app/states/inference"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import {
	LoopState,
	LoopStateExecution,
	LoopVisitor,
	ReceivedMessage,
} from "../../domain/agentic-environment/loop/loop-state"

export class MessageReceivedState implements LoopState<ReceivedMessage, LoopStateExecution<"message_received">> {
	readonly id = "message_received"

	async run(input: ReceivedMessage, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"message_received">> {
		loopVisitor.visitMessageReceivedStarted(input)

		const userMessage = UserMessageItem.create(input.content)

		const output: InferenceInput = {
			...input.input,
			context: input.input.context.addContextItems([userMessage]),
		}

		loopVisitor.visitMessageReceivedCompleted(output)
		return {
			stateId: this.id,
			input,
			output,
		}
	}
}
