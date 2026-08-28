import { InferenceInput, InferenceOutput } from "./states/inference"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallParams } from "@domain/agentic-environment/loop/states/function-call"

export type LoopStateId = "message_received" | "inference" | "function_call" | "model_message" | "idle"

export type ReceivedMessage = {
	content: string
	input: InferenceInput
}

export interface FunctionCallExecutionOutput {
	item: FunctionCallOutputItem
}

export interface ModelMessageParams {
	message: ModelMessageItem
}

// ============================================================
// State contracts
// ============================================================

export interface LoopStateContract {
	message_received: {
		input: ReceivedMessage
		output: InferenceInput
	}

	inference: {
		input: InferenceInput
		output: InferenceOutput
	}

	function_call: {
		input: FunctionCallParams
		output: FunctionCallExecutionOutput
	}

	model_message: {
		input: ModelMessageParams
		output: void
	}

	idle: {
		input: undefined
		output: void
	}
}

export type ExecutableLoopStateId = Exclude<LoopStateId, "idle">

// ============================================================
// State execution
// ============================================================

export type LoopStateExecution<TStateId extends ExecutableLoopStateId = ExecutableLoopStateId> = {
	[K in TStateId]: {
		stateId: K
		input: LoopStateContract[K]["input"]
		output: LoopStateContract[K]["output"]
	}
}[TStateId]

export interface LoopState<TStateId extends ExecutableLoopStateId> {
	readonly id: TStateId

	run(input: LoopStateContract[TStateId]["input"]): Promise<LoopStateExecution<TStateId>>
}

// ============================================================
// Loop transition
// ============================================================

export type LoopTransition<TStateId extends LoopStateId = LoopStateId> = {
	[K in TStateId]: {
		nextStateId: K
		input: LoopStateContract[K]["input"]
	}
}[TStateId]
