import { ReasoningEffort } from "@domain/generative-model/capability/reasoning-effort"

/**
 * DeepSeek V4 reasoning levels. `"none"` selects non-thinking mode
 * (`thinking: { type: "disabled" }`); any other value enables thinking
 * mode and is forwarded as the `reasoning_effort` request parameter.
 */
export type DeepSeekReasoningEffortType = "max" | "high" | "medium" | "low" | "none"

export class DeepSeekReasoningEffort implements ReasoningEffort<DeepSeekReasoningEffortType> {
	reasoningEffort: DeepSeekReasoningEffortType

	constructor(reasoningEffort: DeepSeekReasoningEffortType) {
		this.reasoningEffort = reasoningEffort
	}

	setReasoningEffort(effort: DeepSeekReasoningEffortType): void {
		this.reasoningEffort = effort
	}

	getReasoningEffort(): DeepSeekReasoningEffortType {
		if (!this.reasoningEffort) {
			throw new Error("Reasoning effort not supported")
		}
		return this.reasoningEffort
	}
}
