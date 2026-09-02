import { InferenceInput } from "@app/states/inference"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { LoopState, LoopStateExecution, ReceivedMessage } from "@domain/agentic-environment/loop/loop-state"
import { LoopVisitor } from "@domain/agentic-environment/loop/loop-visitor"

export class ContextUpdateState implements LoopState<ReceivedMessage, LoopStateExecution<"context_update">> {
	readonly id = "context_update"

	async run(input: ReceivedMessage, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"context_update">> {
		loopVisitor.visitContextUpdateStarted(input)

		const userMessage = UserMessageItem.create(input.content)

		const output: InferenceInput = {
			...input.input,
			context: input.input.context.addContextItems([userMessage]),
		}

		loopVisitor.visitContextUpdateCompleted(output)
		return {
			stateId: this.id,
			input,
			output,
		}
	}
}
