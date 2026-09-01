import { InferenceInput } from "@app/states/inference"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { LoopState, LoopStateExecution, ReceivedMessage } from "@domain/agentic-environment/loop/loop-state"
import { LoopVisitor } from "@domain/agentic-environment/loop/loop-visitor"

export class ContextPreparationState implements LoopState<ReceivedMessage, LoopStateExecution<"context_preparation">> {
	readonly id = "context_preparation"

	async run(input: ReceivedMessage, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"context_preparation">> {
		loopVisitor.visitContextPreparationStarted(input)

		const userMessage = UserMessageItem.create(input.content)

		const output: InferenceInput = {
			...input.input,
			context: input.input.context.addContextItems([userMessage]),
		}

		loopVisitor.visitContextPreparationCompleted(output)
		return {
			stateId: this.id,
			input,
			output,
		}
	}
}
