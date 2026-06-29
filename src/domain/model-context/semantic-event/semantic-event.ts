export class SemanticEvent<T> {
	readonly type: string
	readonly producerId: string
	readonly data: T

	constructor(type: string, producerId: string, data: T) {
		this.type = type
		this.data = data
		this.producerId = producerId
	}

	getType(): string {
		return this.type
	}

	getProducerId(): string {
		return this.producerId
	}

	getData(): T {
		return this.data
	}

	static create<T>({ type, producerId, data }: { type: string; producerId: string; data: T }): SemanticEvent<T> {
		return new SemanticEvent(type, producerId, data)
	}
}
