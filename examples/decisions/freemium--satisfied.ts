import { Memory } from "@domain/agentic-environment/agent/memory"
import { DecisionSpecification } from "@domain/agentic-environment/behavior/decision-specification"
import { FreemiumContract } from "examples/contracts/freemium"
import { SemanticEvent } from "src"

export class FreemiumSatisfied extends DecisionSpecification {
	constructor(private readonly numberOfTry: number) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, memory: Memory, contract: FreemiumContract): boolean {
		if (event.getType() !== "inference_requested") {
			return false
		}

		return contract.getNumberOfTry() < this.numberOfTry
	}
}
