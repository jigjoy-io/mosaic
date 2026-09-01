import { RuntimeService } from "@app/services/runtime"
import { AgentLoop } from "@domain/agentic-environment/loop/agent-loop"
import { LoopStateExecutor } from "@domain/agentic-environment/loop/state-executor"
import { FunctionCallState } from "@app/states/function-call"
import { InferenceInput, InferenceState } from "@app/states/inference"
import { ContextPreparationState } from "@app/states/context-preparation"
import { ModelMessageState } from "@app/states/model-message"
import { TransitionResolver } from "@domain/agentic-environment/loop/transition-resolver"
import {
	FunctionCallToInferenceRule,
	InferenceToFunctionCallRule,
	InferenceToModelMessageRule,
	MessageReceivedToInferenceRule,
	ModelMessageToIdleRule,
} from "@domain/agentic-environment/loop/transition-rule"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventPublisherLoopVisitor } from "@domain/agentic-environment/loop/event-publisher-visitor"

export function createRunLoop<TRuntimeState extends RuntimeState>(resolveRuntime: () => RuntimeService<TRuntimeState>) {
	return function runLoop(agentId: string, message: string, inferenceInput: InferenceInput) {
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
			new ContextPreparationState(),
			new InferenceState(inferenceRunner),
			new FunctionCallState(functionCallRunner),
			new ModelMessageState(),
		)

		const agentLoop = new AgentLoop(
			stateExecutor,
			transitionResolver,
			new EventPublisherLoopVisitor(agentId, runtime),
		)

		agentLoop.run({
			content: message,
			input: inferenceInput,
		})
	}
}
