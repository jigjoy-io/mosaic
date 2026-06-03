import { ReasoningEffort } from "@domain/generative-model/capability/reasoning-effort"

export type OpenAIReasoningEffortType = "xhigh" | "high" | "medium" | "low" | "none"

export class OpenAIReasoningEffort implements ReasoningEffort<OpenAIReasoningEffortType> {
	reasoningEffort: OpenAIReasoningEffortType

	constructor(reasoningEffort: OpenAIReasoningEffortType) {
		this.reasoningEffort = reasoningEffort
	}

	setReasoningEffort(effort: OpenAIReasoningEffortType): void {
		this.reasoningEffort = effort
	}
	getReasoningEffort(): OpenAIReasoningEffortType {
		if (!this.reasoningEffort) {
			throw new Error("Reasoning effort not supported")
		}
		return this.reasoningEffort
	}
}
