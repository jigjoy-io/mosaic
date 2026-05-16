import { ToolCallingCapability } from "@domain/generative-model/capabilities/tool-calling"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { Tool } from "@domain/generative-model/tool"

export class Claude45Haiku implements GenerativeModel, ToolCallingCapability {
	readonly specification = {
		name: "claude-haiku-4-5",
		supportReasoningEffort: false,
		defaultReasoningEffort: undefined,
		supportStreaming: true,
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

	setReasoningEffort(_effort: string): void {
		throw new Error("Reasoning effort not supported")
	}

	getReasoningEffort(): string {
		throw new Error("Reasoning effort not supported")
	}
}
