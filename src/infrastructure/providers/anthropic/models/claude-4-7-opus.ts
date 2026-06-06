import { ModelSpecification } from "@domain/generative-model/model-specification"

export const claudeOpus47Specification: ModelSpecification = {
    name: "claude-opus-4-7",
    provider: "anthropic",
    supportsReasoningEffort: true,
    supportedReasoningEfforts: ["max", "xhigh", "high", "medium", "low"],
    supportsStreaming: true,
    contextWindowSize: 200_000,
    maxOutputTokens: 32_000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true
}