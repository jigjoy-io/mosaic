import { Tool } from "@domain/generative-model/tool"
import { ModelContext } from "@domain/model-context/model-context"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { Participant } from "../participant"
import { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"

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
