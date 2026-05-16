import { ReasoningEffort } from "@core/generative-model/capabilities/reasoning-effort"
import { ToolCallingCapability } from "@core/generative-model/capabilities/tool-calling"
import { GenerativeModel } from "@core/generative-model/generative-model"
import { Tool } from "@core/generative-model/tool"
import { AnthropicReasoningEffort, AnthropicReasoningEffortType } from "@anthropic/reasoning-effort"

export class Claude46Sonnet implements GenerativeModel, ReasoningEffort<AnthropicReasoningEffortType>, ToolCallingCapability {
	readonly specification = {
		name: "claude-sonnet-4-6-20251101",
		supportReasoningEffort: true,
		defaultReasoningEffort: "low" as AnthropicReasoningEffortType,
		supportStreaming: false,
		contextWindowSize: 200_000,
		maxOutputTokens: 64_000,
		supportFunctionCalling: true,
	}

	private tools: Tool[] = []

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
