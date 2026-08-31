import { defineRuntime, RuntimeState } from "src"

export class FreemiumAccount {
	private constructor(
		id: string,
		private numberOfTry: number,
		private readonly maxNumberOfTry: number,
	) {}

	getNumberOfTry(): number {
		return this.numberOfTry
	}

	addTry(): void {
		this.numberOfTry++
	}

	getMaxNumberOfTry(): number {
		return this.maxNumberOfTry
	}

	static init(maxNumberOfTry: number): FreemiumAccount {
		const id = crypto.randomUUID()
		return new FreemiumAccount(id, 0, maxNumberOfTry)
	}

	static rehydrate({
		id,
		numberOfTry,
		maxNumberOfTry,
	}: {
		id: string
		numberOfTry: number
		maxNumberOfTry: number
	}): FreemiumAccount {
		return new FreemiumAccount(id, numberOfTry, maxNumberOfTry)
	}
}

export class EnvironmentState extends RuntimeState {
	constructor(public readonly freemiumAccount: FreemiumAccount) {
		super()
	}
}

export const { initializeRuntime, resolveRuntime, resolveParticipant, join, leave, sendMessage, runLoop } =
	defineRuntime<EnvironmentState>()
