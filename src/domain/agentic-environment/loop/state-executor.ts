import { ExecutableLoopStateId, LoopStateExecution, LoopTransition } from "./loop-state"
import { FunctionCallState } from "./states/function-call"
import { InferenceState } from "./states/inference"
import { MessageReceivedState } from "./states/message-received"
import { ModelMessageState } from "./states/model-message"

export class LoopStateExecutor {
	constructor(
		private readonly messageReceivedState: MessageReceivedState,
		private readonly inferenceState: InferenceState,
		private readonly functionCallState: FunctionCallState,
		private readonly modelMessageState: ModelMessageState,
	) {}

	execute(transition: LoopTransition<"message_received">): Promise<LoopStateExecution<"message_received">>

	execute(transition: LoopTransition<"inference">): Promise<LoopStateExecution<"inference">>

	execute(transition: LoopTransition<"function_call">): Promise<LoopStateExecution<"function_call">>

	execute(transition: LoopTransition<"model_message">): Promise<LoopStateExecution<"model_message">>

	execute(transition: LoopTransition<ExecutableLoopStateId>): Promise<LoopStateExecution>

	execute(transition: LoopTransition<ExecutableLoopStateId>): Promise<LoopStateExecution> {
		switch (transition.nextStateId) {
			case "message_received":
				return this.messageReceivedState.run(transition.input)

			case "inference":
				return this.inferenceState.run(transition.input)

			case "function_call":
				return this.functionCallState.run(transition.input)

			case "model_message":
				return this.modelMessageState.run(transition.input)
		}
	}
}
