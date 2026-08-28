import { RuntimeService } from "@app/services/runtime"
import { AgentLoop } from "@domain/agentic-environment/loop/agent-loop"
import { LoopStateExecutor } from "@domain/agentic-environment/loop/state-executor"
import { FunctionCallState } from "@domain/agentic-environment/loop/states/function-call"
import { InferenceInput, InferenceState } from "@domain/agentic-environment/loop/states/inference"
import { MessageReceivedState } from "@domain/agentic-environment/loop/states/message-received"
import { ModelMessageState } from "@domain/agentic-environment/loop/states/model-message"
import { TransitionResolver } from "@domain/agentic-environment/loop/transition-resolver"
import {
	FunctionCallToInferenceRule,
	InferenceToFunctionCallRule,
	InferenceToModelMessageRule,
	MessageReceivedToInferenceRule,
	ModelMessageToIdleRule,
} from "@domain/agentic-environment/loop/transition-rule"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"

export function createStartLoop<TRuntimeState extends RuntimeState>(
	resolveRuntime: () => RuntimeService<TRuntimeState>,
) {
	return function runLoop(message: string, inferenceInput: InferenceInput) {
		const runtime = resolveRuntime()
		const inferenceRunner = runtime.getInferenceRunner()
		const functionCallRunner = runtime.getFunctionCallRunner()

		const transitionResolver = new TransitionResolver([
			// High-priority interception rules would go first.
			new MessageReceivedToInferenceRule(),
			new InferenceToFunctionCallRule(),
			new InferenceToModelMessageRule(),
			new FunctionCallToInferenceRule(),
			new ModelMessageToIdleRule(),
		])

		const stateExecutor = new LoopStateExecutor(
			new MessageReceivedState(),
			new InferenceState(inferenceRunner),
			new FunctionCallState(functionCallRunner),
			new ModelMessageState(),
		)

		const agentLoop = new AgentLoop(stateExecutor, transitionResolver)

		agentLoop.run({
			content: message,
			input: inferenceInput,
		})
	}
}
