export abstract class SemanticEvent {
	abstract readonly type: string
	readonly producerId: string
	readonly occurredAt: Date

	constructor(producerId: string, occurredAt: Date) {
		this.producerId = producerId
		this.occurredAt = occurredAt
	}

	getType(): string {
		return this.type
	}

	getProducerId(): string {
		return this.producerId
	}

	getOccurredAt(): Date {
		return this.occurredAt
	}
}
