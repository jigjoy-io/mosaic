import { Contract } from "@domain/agentic-environment/agent/memory"

export class FreemiumContract extends Contract {
	private constructor(
		id: string,
		private numberOfTry: number,
	) {
		super(id)
	}

	getNumberOfTry(): number {
		return this.numberOfTry
	}

	addTry(): void {
		this.numberOfTry++
	}

	static create(numberOfTry: number): FreemiumContract {
		const id = crypto.randomUUID()
		return new FreemiumContract(id, numberOfTry)
	}

	rehydrate(id: string, numberOfTry: number): FreemiumContract {
		return new FreemiumContract(id, numberOfTry)
	}
}
