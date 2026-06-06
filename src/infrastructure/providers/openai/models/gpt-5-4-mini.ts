import { ModelSpecification } from "@domain/generative-model/model-specification"

export const gpt54MiniSpecification: ModelSpecification = {
    name: "gpt-5.4-mini",
    provider: "openai",
    supportsReasoningEffort: true,
    supportedReasoningEfforts: ["xhigh", "high", "medium", "low", "none"],
    supportsStreaming: true,
    contextWindowSize: 400_000,
    maxOutputTokens: 128_000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true
}