import { Endpoint } from "./endpoint"

export type GenerativeModel = {
	endpoint: Endpoint
	specification: ModelSpecification
}

export type ModelProviders = "openai" | "anthropic" | "gemini" | "deepseek"
export type ModelName =
	| "gpt-5.4"
	| "gpt-5.4-mini"
	| "gpt-5.4-nano"
	| "gpt-5.5"
	| "claude-haiku-4-5"
	| "claude-sonnet-4-6"
	| "claude-opus-4-7"
	| "claude-opus-4-8"
	| "gemini-3.5-flash"
	| "gemini-3.1-pro-preview"
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
