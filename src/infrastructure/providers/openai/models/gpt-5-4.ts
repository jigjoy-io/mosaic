import { ModelSpecification } from "@domain/generative-model/model-specification"

export const gpt54Specification: ModelSpecification = {
    name: "gpt-5.4",
    provider: "openai",
    supportsReasoningEffort: true,
    supportedReasoningEfforts: ["xhigh", "high", "medium", "low", "none"],
    supportsStreaming: true,
    contextWindowSize: 1_050_000,
    maxOutputTokens: 128_000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true
}