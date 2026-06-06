import { ModelSpecification } from "@domain/generative-model/model-specification"

export const gemini31ProSpecification: ModelSpecification = {
    name: "gemini-3.1-pro-preview",
    provider: "google",
    supportsReasoningEffort: true,
    supportedReasoningEfforts: ["high", "medium", "low", "minimal", "none"],
    supportsStreaming: true,
    contextWindowSize: 1_048_576,
    maxOutputTokens: 64_000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true
}