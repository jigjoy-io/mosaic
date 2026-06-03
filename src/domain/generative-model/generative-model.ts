import { ReasoningEffort } from "./capability/reasoning-effort"
import { StreamingCapability } from "./capability/streaming"
import { StructuredOutputCapability } from "./capability/structured-output"
import { ToolCallingCapability } from "./capability/tool-calling"

export type ModelSpecification = {
	name: string
	supportReasoningEffort: boolean
	defaultReasoningEffort: string | undefined
	supportStreaming: boolean
	contextWindowSize: number
	maxOutputTokens: number
	supportFunctionCalling: boolean
	supportStructuredOutput: boolean
}

export interface GenerativeModel
	extends ReasoningEffort<string>,
		ToolCallingCapability,
		StreamingCapability,
		StructuredOutputCapability {
	readonly specification: ModelSpecification
}
