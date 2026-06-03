import { GenerativeModel } from "@domain/generative-model/generative-model"
import { StructuredOutputFormat } from "@domain/generative-model/capabilities/structured-output"
import { Tool } from "@domain/generative-model/tool"
import { OpenAIReasoningEffort, OpenAIReasoningEffortType } from "@infra/providers/openai/reasoning-effort"

export class Gpt54 implements GenerativeModel {
	readonly specification = {
		name: "gpt-5.4",
		supportReasoningEffort: true,
		defaultReasoningEffort: "none" as OpenAIReasoningEffortType,
		supportStreaming: true,
		contextWindowSize: 1_050_000,
		maxOutputTokens: 128_000,
		supportFunctionCalling: true,
		supportStructuredOutput: true,
	}

	private tools: Tool[] = []

	private streaming: boolean = false

	private structuredOutput: StructuredOutputFormat | undefined = undefined

	private readonly effort: OpenAIReasoningEffort = new OpenAIReasoningEffort(
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

	setReasoningEffort(effort: OpenAIReasoningEffortType): void {
		this.effort.setReasoningEffort(effort)
	}

	getReasoningEffort(): OpenAIReasoningEffortType {
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
