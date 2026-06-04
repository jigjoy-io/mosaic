import { ReasoningEffort } from "@domain/generative-model/capability/reasoning-effort"

/**
 * Gemini reasoning levels, forwarded as the `reasoning_effort` request
 * parameter on the OpenAI-compatible endpoint. `"none"` only disables
 * thinking on Gemini 2.5 models; Gemini 3.x always thinks, so for those
 * the adapter simply omits `reasoning_effort` when set to `"none"` and
 * lets the model use its default thinking level.
 */
export type GeminiReasoningEffortType = "high" | "medium" | "low" | "minimal" | "none"

export class GeminiReasoningEffort implements ReasoningEffort<GeminiReasoningEffortType> {
	reasoningEffort: GeminiReasoningEffortType

	constructor(reasoningEffort: GeminiReasoningEffortType) {
		this.reasoningEffort = reasoningEffort
	}

	setReasoningEffort(effort: GeminiReasoningEffortType): void {
		this.reasoningEffort = effort
	}

	getReasoningEffort(): GeminiReasoningEffortType {
		if (!this.reasoningEffort) {
			throw new Error("Reasoning effort not supported")
		}
		return this.reasoningEffort
	}
}
