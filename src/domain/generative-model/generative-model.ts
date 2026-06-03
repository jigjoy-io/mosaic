import { ReasoningEffort } from "./capability/reasoning-effort"
import { StreamingCapability } from "./capability/streaming"
import { ToolCallingCapability } from "./capability/tool-calling"

export type ModelSpecification = {
	name: string
	supportReasoningEffort: boolean
	defaultReasoningEffort: string | undefined
	supportStreaming: boolean
	contextWindowSize: number
	maxOutputTokens: number
	supportFunctionCalling: boolean
}

export interface GenerativeModel extends ReasoningEffort<string>, ToolCallingCapability, StreamingCapability {
	readonly specification: ModelSpecification
}
