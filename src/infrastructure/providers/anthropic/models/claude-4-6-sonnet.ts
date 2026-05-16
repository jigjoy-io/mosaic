import { ReasoningEffort } from "@domain/generative-model/capabilities/reasoning-effort"
import { ToolCallingCapability } from "@domain/generative-model/capabilities/tool-calling"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { Tool } from "@domain/generative-model/tool"
import {
	AnthropicReasoningEffort,
	AnthropicReasoningEffortType,
} from "@infra/providers/anthropic/reasoning-effort"

export class Claude46Sonnet
	implements GenerativeModel, ReasoningEffort<AnthropicReasoningEffortType>, ToolCallingCapability
{
	readonly specification = {
		name: "claude-sonnet-4-6-20260101",
		supportReasoningEffort: true,
		defaultReasoningEffort: "none" as AnthropicReasoningEffortType,
		supportStreaming: false,
		contextWindowSize: 200_000,
		maxOutputTokens: 32_000,
		supportFunctionCalling: true,
	}

	private tools: Tool[] = []

	setTools(tools: Tool[]): void {
		this.tools = tools
	}

	getTools(): Tool[] {
		return this.tools
	}

	private readonly effort = new AnthropicReasoningEffort(this.specification.defaultReasoningEffort)

	setReasoningEffort(effort: AnthropicReasoningEffortType): void {
		this.effort.setReasoningEffort(effort)
	}

	getReasoningEffort(): AnthropicReasoningEffortType {
		return this.effort.getReasoningEffort()
	}
}
