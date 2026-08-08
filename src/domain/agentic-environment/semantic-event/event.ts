import { FunctionCallOutputParams, FunctionCallParams } from "@app/services/function-call"
import { InferenceResponse } from "../inference/response"

export interface SemanticEvent<TType extends string = string, TPayload = unknown> {
	readonly type: TType
	readonly producerId: string
	readonly occurredAt: Date
	readonly payload: TPayload
}

export type AgentJoinedEvent = SemanticEvent<"agent.joined", { agentId: string }>

export type UserJoinedEvent = SemanticEvent<"user.joined", { userId: string }>

export type FunctionCallRequestedEvent = SemanticEvent<"function.call.requested", FunctionCallParams>

export type FunctionCallOutputEvent = SemanticEvent<"function.call.output", FunctionCallOutputParams>

export type InferenceCompletedEvent = SemanticEvent<"inference.completed", InferenceResponse>
