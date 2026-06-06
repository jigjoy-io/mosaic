export type ModelSpecification = {
	name: string
	provider: string
	supportsReasoningEffort: boolean
	supportedReasoningEfforts: string[]
	supportsStreaming: boolean
	contextWindowSize: number
	maxOutputTokens: number
	supportsFunctionCalling: boolean
	supportsStructuredOutput: boolean
}