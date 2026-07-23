import { Contract } from "@domain/agentic-environment/agent/memory"

export class FreemiumContract extends Contract {
	constructor(private numberOfTry: number) {
		super()
	}

	getNumberOfTry(): number {
		return this.numberOfTry
	}

	addTry(): void {
		this.numberOfTry++
	}
}
