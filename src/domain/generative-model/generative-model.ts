import { ReasoningEffort } from "./capabilities/reasoning-effort"
import { StreamingCapability } from "./capabilities/streaming"
import { StructuredOutputCapability } from "./capabilities/structured-output"
import { ToolCallingCapability } from "./capabilities/tool-calling"

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
