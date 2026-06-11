import type { Tool } from "@domain/generative-model/tool"
import type { ModelContext } from "@domain/model-context/model-context"
import type { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import type { Participant } from "../participant"
import type { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"

export type InferenceParams<TModel extends string> = {
	model: TModel
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Tool[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: ModelContext
	caller: Participant
	environment: AgenticEnvironment
	signal?: AbortSignal
}
