export interface SemanticEvent<TType extends string = string, TPayload = unknown> {
	readonly type: TType
	readonly producerId: string
	readonly occurredAt: Date
	readonly payload: TPayload
}

export type AgentJoinedEvent = SemanticEvent<"agent.joined", { agentId: string }>

export type UserJoinedEvent = SemanticEvent<"user.joined", { userId: string }>
