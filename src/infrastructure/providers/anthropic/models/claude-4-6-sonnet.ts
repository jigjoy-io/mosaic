import { ModelSpecification } from "@domain/generative-model/model-specification"

export const claudeSonnet46Specification: ModelSpecification = {
    name: "claude-sonnet-4-6",
    provider: "anthropic",
    supportsReasoningEffort: true,
    supportedReasoningEfforts: ["max", "high", "medium", "low"],
    supportsStreaming: true,
    contextWindowSize: 200_000,
    maxOutputTokens: 64_000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true
}
