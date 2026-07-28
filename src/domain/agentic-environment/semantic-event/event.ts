import { FunctionCallParams } from "@app/services/function-call"
import { InferenceResponse } from "../inference/response"

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

export type FunctionCallRequestedEvent = SemanticEvent<"functions.call.requested", FunctionCallParams>

export type FunctionCallCompletedEvent = SemanticEvent<
	"functions.call.completed",
	{ functionId: string; result: unknown }
>

export type InferenceCompletedEvent = SemanticEvent<"inference.completed", InferenceResponse>
