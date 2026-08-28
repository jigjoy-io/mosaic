import { InferenceInput, InferenceOutput } from "../../../application/states/inference"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallParams } from "@app/states/function-call"
import { SemanticEvent } from "../semantic-event/event"

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

export type LoopStateStartedPayload<TStateId extends ExecutableLoopStateId> = {
	stateId: TStateId
	input: LoopStateContract[TStateId]["input"]
}

export type LoopStateCompletedPayload<TStateId extends ExecutableLoopStateId> = {
	stateId: TStateId
	output: LoopStateContract[TStateId]["output"]
}

export interface LoopVisitor {
	visitMessageReceivedStarted(input: ReceivedMessage): void

	visitMessageReceivedCompleted(output: InferenceInput): void

	visitInferenceStarted(input: InferenceInput): void

	//visitInferenceEvent(event: InferenceStreamItem): void

	visitInferenceCompleted(output: InferenceOutput): void

	visitFunctionCallStarted(input: FunctionCallParams): void

	//visitFunctionCallEvent(event: FunctionCallStreamItem): void

	visitFunctionCallCompleted(output: FunctionCallOutputItem): void
}

export interface LoopState<TInput, TOutput> {
	readonly id: LoopStateId

	run(input: TInput, visitor: LoopVisitor): Promise<TOutput>
}

export type LoopStateExecution<TStateId extends ExecutableLoopStateId = ExecutableLoopStateId> = {
	[K in TStateId]: {
		stateId: K
		input: LoopStateContract[K]["input"]
		output: LoopStateContract[K]["output"]
	}
}[TStateId]

// ============================================================
// Loop transition
// ============================================================

export type LoopTransition<TStateId extends LoopStateId = LoopStateId> = {
	[K in TStateId]: {
		nextStateId: K
		input: LoopStateContract[K]["input"]
	}
}[TStateId]

export type LoopStateStartedEvent<TStateId extends ExecutableLoopStateId = ExecutableLoopStateId> = {
	[K in TStateId]: SemanticEvent<"loop.state.started", LoopStateStartedPayload<K>>
}[TStateId]

export type LoopStateCompletedEvent<TStateId extends ExecutableLoopStateId = ExecutableLoopStateId> = {
	[K in TStateId]: SemanticEvent<"loop.state.completed", LoopStateCompletedPayload<K>>
}[TStateId]
