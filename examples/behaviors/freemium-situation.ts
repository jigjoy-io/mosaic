import { Agent } from "@domain/agentic-environment/agent/agent"
import { ParticipantMessage } from "@domain/agentic-environment/events/participant-message"
import { Situation } from "@domain/agentic-environment/behavior/situation"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"

export class FreemiumRuntimeState extends RuntimeState {
	constructor(public readonly freemiumAccount: FreemiumAccount) {
		super()
	}
}

export interface FreemiumSituation extends Situation {
	readonly event: ParticipantMessage
	readonly participant: Agent
	readonly runtimeState: FreemiumRuntimeState
}

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

	rehydrate(id: string, numberOfTry: number, maxNumberOfTry: number): FreemiumAccount {
		return new FreemiumAccount(id, numberOfTry, maxNumberOfTry)
	}
}
