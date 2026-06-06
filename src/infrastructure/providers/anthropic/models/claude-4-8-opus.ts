import { ModelSpecification } from "@domain/generative-model/model-specification"

export const claudeOpus48Specification: ModelSpecification = {
    name: "claude-opus-4-8",
    provider: "anthropic",
    supportsReasoningEffort: true,
    supportedReasoningEfforts: ["max", "xhigh", "high", "medium", "low"],
    supportsStreaming: true,
    contextWindowSize: 200_000,
    maxOutputTokens: 32_000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true
}