import { GenerativeModel } from "@domain/generative-model/generative-model"
import { StructuredOutputFormat } from "@domain/generative-model/capability/structured-output"
import { Tool } from "@domain/generative-model/tool"
import { AnthropicReasoningEffort, AnthropicReasoningEffortType } from "@infra/providers/anthropic/reasoning-effort"

export class ClaudeSonnet46 implements GenerativeModel {
	readonly specification = {
		name: "claude-sonnet-4-6",
		provider: "anthropic",
		supportReasoningEffort: true,
		defaultReasoningEffort: "none" as AnthropicReasoningEffortType,
		supportStreaming: true,
		contextWindowSize: 200_000,
		maxOutputTokens: 64_000,
		supportFunctionCalling: true,
		supportStructuredOutput: true,
	}

	private tools: Tool[] = []

	private streaming: boolean = false

	private structuredOutput: StructuredOutputFormat | undefined = undefined

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

	setStructuredOutput(format: StructuredOutputFormat | undefined): void {
		this.structuredOutput = format
	}

	getStructuredOutput(): StructuredOutputFormat | undefined {
		return this.structuredOutput
	}

	hasStructuredOutput(): boolean {
		return this.structuredOutput !== undefined
	}
}
