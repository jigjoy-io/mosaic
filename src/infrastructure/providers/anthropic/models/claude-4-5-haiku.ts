import { ModelSpecification } from "@domain/generative-model/model-specification"

export const claudeHaiku45Specification: ModelSpecification = {
    name: "claude-haiku-4-5",
    provider: "anthropic",
    supportsReasoningEffort: true,
    supportedReasoningEfforts: ["high", "medium", "low", "none"],
    supportsStreaming: true,
    contextWindowSize: 200_000,
    maxOutputTokens: 64_000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true
}