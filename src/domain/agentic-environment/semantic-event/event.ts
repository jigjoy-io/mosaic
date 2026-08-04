import { FunctionCallOutputParams, FunctionCallParams } from "@app/services/function-call"
import { InferenceResponse } from "../inference/response"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"

export interface SemanticEvent<TType extends string = string, TPayload = unknown> {
	readonly type: TType
	readonly producerId: string
	readonly occurredAt: Date
	readonly payload: TPayload
}

export type AgentJoinedEvent = SemanticEvent<"agent.joined", { agentId: string }>

export type UserJoinedEvent = SemanticEvent<"user.joined", { userId: string }>

export type UserMessageSentEvent = SemanticEvent<"user.sent.message", { userId: string; message: string }>

export type AgentMessageSentEvent = SemanticEvent<"agent.sent.message", { agentId: string; message: string }>

export type FunctionCallRequestedEvent = SemanticEvent<"function.call.requested", FunctionCallParams>

export type FunctionCallOutputEvent = SemanticEvent<"function.call.output", FunctionCallOutputParams>

export type InferenceCompletedEvent = SemanticEvent<"inference.completed", InferenceResponse>
