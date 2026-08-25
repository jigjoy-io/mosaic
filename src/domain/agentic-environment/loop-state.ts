import { FunctionCallOutputParams, FunctionCallParams } from "@app/services/function-call"
import { LoopStateId } from "./agent-loop"
import { FunctionCallRunner } from "./function-call-runner"
import { InferenceRequest } from "./inference/request"
import { InferenceResponse } from "./inference/response"
import { InferenceRunner } from "@app/services/inference-runner"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"

export type MessageReceivedParams = {
	message: string
}
export type StateParams = MessageReceivedParams | FunctionCallParams | InferenceRequest | InferenceResponse

export type OutputParams = FunctionCallOutputParams | InferenceResponse

export interface LoopState {
	run(params: StateParams): Promise<LoopStateResult>
}

export type NextState = {
	stateId: LoopStateId
	params: StateParams
}

export interface LoopStateResult {
	stateId: LoopStateId
	contextItems: ContextItem[]
}

export class MessageReceived implements LoopState {
	async run(params: MessageReceivedParams): Promise<LoopStateResult> {
		return {
			stateId: "message_received",
			contextItems: [UserMessageItem.create(params.message)],
		}
	}
}

export class FunctionCall implements LoopState {
	public readonly id = "function_call"

	constructor(private readonly functionCallRunner: FunctionCallRunner) {}

	async run(params: FunctionCallParams): Promise<LoopStateResult> {
		const functionCallOutput = await this.functionCallRunner.run(params)

		return {
			stateId: "function_call",
			contextItems: [FunctionCallOutputItem.create(params.call.callId, functionCallOutput.message)],
		}
	}
}

export class InferenceCall implements LoopState {
	constructor(private readonly inferenceRunner: InferenceRunner) {}

	async run(params: InferenceRequest): Promise<LoopStateResult> {
		const response = await this.inferenceRunner.runInference(params)
		return {
			stateId: "inference",
			contextItems: response.contextItems,
		}
	}
}

export class InferenceStream implements LoopState {
	public readonly id = "inference_stream"

	constructor(private readonly inferenceRunner: InferenceRunner) {}

	async run(params: InferenceRequest): Promise<LoopStateResult> {
		const stream = await this.inferenceRunner.streamInference(params)

		let lastEvent: any = null
		for await (const event of stream) {
			lastEvent = event
		}

		const inferenceResponse = lastEvent as InferenceResponse

		return {
			stateId: "inference_stream",
			contextItems: inferenceResponse.contextItems,
		}
	}
}

export class ModelMessage implements LoopState {
	public readonly id = "model_message"

	async run(params: InferenceResponse): Promise<LoopStateResult> {
		return {
			stateId: "model_message",
			contextItems: params.contextItems,
		}
	}
}
