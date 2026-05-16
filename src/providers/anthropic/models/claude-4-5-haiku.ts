import { ReasoningEffort } from "@core/generative-model/capabilities/reasoning-effort"
import { ToolCallingCapability } from "@core/generative-model/capabilities/tool-calling"
import { GenerativeModel } from "@core/generative-model/generative-model"
import { Tool } from "@core/generative-model/tool"
import { AnthropicReasoningEffort, AnthropicReasoningEffortType } from "@anthropic/reasoning-effort"

export class Claude45Haiku implements GenerativeModel, ReasoningEffort<AnthropicReasoningEffortType>, ToolCallingCapability {
	readonly specification = {
		name: "claude-haiku-4-5-20251101",
		supportReasoningEffort: false,
		defaultReasoningEffort: "none" as AnthropicReasoningEffortType,
		supportStreaming: false,
		contextWindowSize: 200_000,
		maxOutputTokens: 8_192,
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
