export class SemanticEvent<TType extends string = string, TPayload = unknown> {
	readonly type: TType
	readonly producerId: string
	readonly occurredAt: Date
	readonly payload: TPayload

	constructor(type: TType, producerId: string, occurredAt: Date, payload: TPayload) {
		this.type = type
		this.producerId = producerId
		this.occurredAt = occurredAt
		this.payload = payload
	}

	static create<TType extends string = string, TPayload = unknown>(
		type: TType,
		producerId: string,
		payload: TPayload,
	): SemanticEvent<TType, TPayload> {
		const occurredAt = new Date()
		return new SemanticEvent(type, producerId, occurredAt, payload)
	}
}

export type AgentJoinedEvent = SemanticEvent<"agent.joined", { agentId: string }>

export type UserJoinedEvent = SemanticEvent<"user.joined", { userId: string }>

export class MessageSentEvent extends SemanticEvent<"message.sent", { message: string }> {
	static init(producerId: string, message: string): MessageSentEvent {
		return SemanticEvent.create("message.sent", producerId, { message })
	}
}
