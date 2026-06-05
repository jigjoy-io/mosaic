import { GenerativeModel } from "../generative-model"
import { CapabilitySpecification } from "./specification"

export interface ReasoningEffort<Effort extends string> {
	setReasoningEffort(effort: Effort): void
	getReasoningEffort(): Effort
}

export class ReasoningEffortSpecification implements CapabilitySpecification {
    isSatisfiedBy(model: GenerativeModel): boolean {
        return model.specification.supportReasoningEffort
    }
}
