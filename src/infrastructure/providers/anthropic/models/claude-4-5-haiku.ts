import { GenerativeModel } from "@domain/generative-model/generative-model"
import { Tool } from "@domain/generative-model/tool"
import { AnthropicReasoningEffort, AnthropicReasoningEffortType } from "@infra/providers/anthropic/reasoning-effort"

export class ClaudeHaiku45 implements GenerativeModel {
	readonly specification = {
		name: "claude-haiku-4-5",
		supportReasoningEffort: true,
		defaultReasoningEffort: "none" as AnthropicReasoningEffortType,
		supportStreaming: true,
		contextWindowSize: 200_000,
		maxOutputTokens: 64_000,
		supportFunctionCalling: true,
	}

	private tools: Tool[] = []

	private streaming: boolean = false

	setStreaming(streaming: boolean): void {
		this.streaming = streaming
	}

	getStreaming(): boolean {
		return this.streaming
	}

	setTools(tools: Tool[]): void {
		this.tools = tools
	}

	getTools(): Tool[] {
		return this.tools
	}

	private readonly effort: AnthropicReasoningEffort = new AnthropicReasoningEffort(
		this.specification.defaultReasoningEffort,
	)

	setReasoningEffort(effort: AnthropicReasoningEffortType): void {
		this.effort.setReasoningEffort(effort)
	}

	getReasoningEffort(): AnthropicReasoningEffortType {
		return this.effort.getReasoningEffort()
	}
}
