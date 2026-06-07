import { Endpoint } from "./endpoint"

export type GenerativeModel = {
	endpoint: Endpoint
	specification: ModelSpecification
}

export type ModelProviders = "openai" | "anthropic" | "gemini" | "deepseek"
export type ModelName =
	| "gpt-5-4"
	| "gpt-5-4-mini"
	| "gpt-5-4-nano"
	| "gpt-5-5"
	| "claude-4-5-haiku"
	| "claude-4-6-sonnet"
	| "claude-4-7-opus"
	| "claude-4-8-opus"
	| "gemini-3-5-flash"
	| "gemini-3-1-pro"
	| "deepseek-v4-flash"
	| "deepseek-v4-pro"

export type ModelSpecification = {
	name: string
	provider: string
	supportsReasoningEffort: boolean
	supportedReasoningEfforts: string[]
	supportsStreaming: boolean
	contextWindowSize: number
	supportedContextItemTypes: string[]
	maxOutputTokens: number
	supportsFunctionCalling: boolean
	supportsStructuredOutput: boolean
}
