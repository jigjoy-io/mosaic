import { ExecutableLoopStateId, LoopStateExecution, LoopTransition } from "./loop-state"
import { LoopVisitor } from "./loop-visitor"
import { FunctionCallState } from "@app/states/function-call"
import { InferenceState } from "@app/states/inference"
import { ContextPreparationState } from "@app/states/context-preparation"
import { ModelMessageState } from "@app/states/model-message"

export class LoopStateExecutor {
	constructor(
		private readonly contextPreparationState: ContextPreparationState,
		private readonly inferenceState: InferenceState,
		private readonly functionCallState: FunctionCallState,
		private readonly modelMessageState: ModelMessageState,
	) {}

	execute(
		transition: LoopTransition<"context_preparation">,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution<"context_preparation">>

	execute(transition: LoopTransition<"inference">, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"inference">>

	execute(
		transition: LoopTransition<"function_call">,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution<"function_call">>

	execute(
		transition: LoopTransition<"model_message">,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution<"model_message">>

	execute(transition: LoopTransition<ExecutableLoopStateId>, loopVisitor: LoopVisitor): Promise<LoopStateExecution>

	async execute(
		transition: LoopTransition<ExecutableLoopStateId>,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution> {
		switch (transition.nextStateId) {
			case "context_preparation":
				return await this.contextPreparationState.run(transition.input, loopVisitor)

			case "inference":
				return await this.inferenceState.run(transition.input, loopVisitor)

			case "function_call":
				return await this.functionCallState.run(transition.input, loopVisitor)

			case "model_message":
				return await this.modelMessageState.run(transition.input, loopVisitor)
		}
	}
}
