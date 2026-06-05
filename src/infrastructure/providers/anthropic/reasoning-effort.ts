import { ReasoningEffort } from "@domain/generative-model/capability/reasoning-effort"

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
