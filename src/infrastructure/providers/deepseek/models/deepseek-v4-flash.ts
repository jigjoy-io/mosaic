import { ModelSpecification } from "@domain/generative-model/model-specification"

export const deepSeekV4FlashSpecification: ModelSpecification = {
    name: "deepseek-v4-flash",
    provider: "deepseek",
    supportsReasoningEffort: true,
    supportedReasoningEfforts: ["max", "high", "medium", "low", "none"],
    supportsStreaming: true,
    contextWindowSize: 1_000_000,
    maxOutputTokens: 384_000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: false
}