import { GenerativeModel } from "@domain/generative-model/generative-model"
import { StructuredOutputFormat } from "@domain/generative-model/capability/structured-output"
import { Tool } from "@domain/generative-model/tool"
import { GeminiReasoningEffort, GeminiReasoningEffortType } from "@infra/providers/gemini/reasoning-effort"

export class Gemini35Flash implements GenerativeModel {
	readonly specification = {
		name: "gemini-3.5-flash",
		supportReasoningEffort: true,
		defaultReasoningEffort: "medium" as GeminiReasoningEffortType,
		supportStreaming: true,
		contextWindowSize: 1_048_576,
		maxOutputTokens: 64_000,
		supportFunctionCalling: true,
		supportStructuredOutput: true,
	}

	private tools: Tool[] = []

	private streaming: boolean = false

	private structuredOutput: StructuredOutputFormat | undefined = undefined

	private readonly effort: GeminiReasoningEffort = new GeminiReasoningEffort(
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

	setReasoningEffort(effort: GeminiReasoningEffortType): void {
		this.effort.setReasoningEffort(effort)
	}

	getReasoningEffort(): GeminiReasoningEffortType {
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
