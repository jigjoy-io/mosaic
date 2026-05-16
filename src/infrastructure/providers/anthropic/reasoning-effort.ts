import { ReasoningEffort } from "@domain/generative-model/capabilities/reasoning-effort"

export type AnthropicReasoningEffortType = "high" | "medium" | "low" | "none"

const BUDGET_TIERS: Record<AnthropicReasoningEffortType, number> = {
	high: 16000,
	medium: 8000,
	low: 2000,
	none: 0,
}

export function anthropicReasoningEffortToBudgetTokens(effort: AnthropicReasoningEffortType): number {
	return BUDGET_TIERS[effort]
}

export class AnthropicReasoningEffort implements ReasoningEffort<AnthropicReasoningEffortType> {
	reasoningEffort: AnthropicReasoningEffortType

	constructor(reasoningEffort: AnthropicReasoningEffortType) {
		this.reasoningEffort = reasoningEffort
	}

	setReasoningEffort(effort: AnthropicReasoningEffortType): void {
		this.reasoningEffort = effort
	}
	getReasoningEffort(): AnthropicReasoningEffortType {
		if (!this.reasoningEffort) {
			throw new Error("Reasoning effort not supported")
		}
		return this.reasoningEffort
	}
}
