import type { Tool } from "@domain/generative-model/tool"
import type { ModelContext } from "@domain/model-context/model-context"
import type { Channel } from "@domain/agentic-environment/channel"
import type { Participant } from "../participant"
import type { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"
import { ModelName } from "@domain/generative-model/generative-model"

export type InferenceParams = {
	model: ModelName
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Tool[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: ModelContext
	caller: Participant
	channel: Channel
	signal?: AbortSignal
}
