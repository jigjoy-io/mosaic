import type { Tool } from "@domain/generative-model/tool"
import type { ModelContext } from "@domain/model-context/model-context"
import type { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"

export type InferenceRequest = {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Tool[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: ModelContext
	callerId: string
}
