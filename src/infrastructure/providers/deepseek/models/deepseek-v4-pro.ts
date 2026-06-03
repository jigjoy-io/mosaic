import { GenerativeModel } from "@domain/generative-model/generative-model"
import { StructuredOutputFormat } from "@domain/generative-model/capabilities/structured-output"
import { Tool } from "@domain/generative-model/tool"
import { DeepSeekReasoningEffort, DeepSeekReasoningEffortType } from "@infra/providers/deepseek/reasoning-effort"

export class DeepSeekV4Pro implements GenerativeModel {
	readonly specification = {
		name: "deepseek-v4-pro",
		supportReasoningEffort: true,
		defaultReasoningEffort: "high" as DeepSeekReasoningEffortType,
		supportStreaming: true,
		contextWindowSize: 1_000_000,
		maxOutputTokens: 384_000,
		supportFunctionCalling: true,
		supportStructuredOutput: false,
	}

	private tools: Tool[] = []

	private streaming: boolean = false

	private structuredOutput: StructuredOutputFormat | undefined = undefined

	private readonly effort: DeepSeekReasoningEffort = new DeepSeekReasoningEffort(
		this.specification.defaultReasoningEffort,
	)

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

	setReasoningEffort(effort: DeepSeekReasoningEffortType): void {
		this.effort.setReasoningEffort(effort)
	}

	getReasoningEffort(): DeepSeekReasoningEffortType {
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
