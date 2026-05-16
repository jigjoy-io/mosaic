import { ReasoningEffort } from "@domain/generative-model/capabilities/reasoning-effort"

export type AnthropicReasoningEffortType = "high" | "medium" | "low" | "none"

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

export function anthropicReasoningBudgetTokens(effort: AnthropicReasoningEffortType): number | undefined {
	switch (effort) {
		case "low":
			return 1024
		case "medium":
			return 4096
		case "high":
			return 8192
		case "none":
			return undefined
	}
}
