import { AnthropicMessages } from "@infra/providers/anthropic/runtime/anthropic-messages";
import { OpenAIResponses } from "@infra/providers/openai/runtime/openai-responses";
import { GeminiGenerateContent } from "@infra/providers/gemini/runtime/gemini-generate-content";
import { OpenAIChatCompletions } from "@infra/providers/openai/runtime/openai-chat-completions";
import { GenerativeModel } from "@domain/generative-model/generative-model";
import { ClaudeHaiku45 } from "@infra/providers/anthropic/models/claude-4-5-haiku";
import { ClaudeSonnet46 } from "@infra/providers/anthropic/models/claude-4-6-sonnet";
import { ClaudeOpus48 } from "@infra/providers/anthropic/models/claude-4-8-opus";
import { ClaudeOpus47 } from "@infra/providers/anthropic/models/claude-4-7-opus";
import { Gemini35Flash } from "@infra/providers/gemini/models/gemini-3-5-flash";
import { Gemini31Pro } from "@infra/providers/gemini/models/gemini-3-1-pro";
import { DeepSeekV4Flash } from "@infra/providers/deepseek/models/deepseek-v4-flash";
import { DeepSeekV4Pro } from "@infra/providers/deepseek/models/deepseek-v4-pro";
import { Gpt54 } from "@infra/providers/openai/models/gpt-5-4";
import { Gpt54Mini } from "@infra/providers/openai/models/gpt-5-4-mini";
import { Gpt54Nano } from "@infra/providers/openai/models/gpt-5-4-nano";
import { Gpt55 } from "@infra/providers/openai/models/gpt-5-5";
import { Endpoint } from "@domain/generative-model/runtime";

export type ModelInfo = {
	endpoint: Endpoint
	model: GenerativeModel
}

export type ModelProviders = "openai" | "anthropic" | "gemini" | "deepseek"
export type ModelName =
	| "gpt-5-4"
	| "gpt-5-4-mini"
	| "gpt-5-4-nano"
	| "gpt-5-5"
	| "claude-4-5-haiku"
	| "claude-4-6-sonnet"
	| "claude-4-7-opus"
	| "claude-4-8-opus"
    | "gemini-3-5-flash"
    | "gemini-3-1-pro"
    | "deepseek-v4-flash"
    | "deepseek-v4-pro"

export class ModelRepository {
    
    getModelInfo(model: string): ModelInfo {
		switch (model) {
			case "gpt-5-4":
                return { endpoint: new OpenAIResponses(), model: new Gpt54() };
			case "gpt-5-4-mini":
                return { endpoint: new OpenAIResponses(), model: new Gpt54Mini() };
			case "gpt-5-4-nano":
                return { endpoint: new OpenAIResponses(), model: new Gpt54Nano() };
			case "gpt-5-5":
                return { endpoint: new OpenAIResponses(), model: new Gpt55() };
			case "claude-4-5-haiku":
                return { endpoint: new AnthropicMessages(), model: new ClaudeHaiku45() };
			case "claude-4-6-sonnet":
                return { endpoint: new AnthropicMessages(), model: new ClaudeSonnet46() };
			case "claude-4-7-opus":
                return { endpoint: new AnthropicMessages(), model: new ClaudeOpus47() };
			case "claude-4-8-opus":
                return { endpoint: new AnthropicMessages(), model: new ClaudeOpus48() };
			case "gemini-3-5-flash":
                return { endpoint: new GeminiGenerateContent(), model: new Gemini35Flash() };
			case "gemini-3-1-pro":
                return { endpoint: new GeminiGenerateContent(), model: new Gemini31Pro() };
			case "deepseek-v4-flash":
                return { endpoint: new OpenAIChatCompletions(), model: new DeepSeekV4Flash() };
			case "deepseek-v4-pro":
				return { endpoint: new OpenAIChatCompletions(), model: new DeepSeekV4Pro() }
			default:
				throw new Error(`Unsupported model: ${model}`)
		}
	}
}
