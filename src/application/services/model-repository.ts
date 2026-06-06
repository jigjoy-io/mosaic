import { AnthropicMessages } from "@infra/providers/anthropic/endpoints/anthropic-messages";
import { OpenAIResponses } from "@infra/providers/openai/endpoints/openai-responses";
import { GeminiGenerateContent } from "@infra/providers/gemini/endpoints/gemini-generate-content";
import { OpenAIChatCompletions } from "@infra/providers/openai/endpoints/openai-chat-completions";
import { ModelSpecification } from "@domain/generative-model/model-specification";
import { claudeSonnet46Specification } from "@infra/providers/anthropic/models/claude-4-6-sonnet";
import { claudeOpus48Specification } from "@infra/providers/anthropic/models/claude-4-8-opus";
import { claudeOpus47Specification } from "@infra/providers/anthropic/models/claude-4-7-opus";
import { gemini35FlashSpecification } from "@infra/providers/gemini/models/gemini-3-5-flash";
import { gemini31ProSpecification } from "@infra/providers/gemini/models/gemini-3-1-pro";
import { deepSeekV4FlashSpecification } from "@infra/providers/deepseek/models/deepseek-v4-flash";
import { deepSeekV4ProSpecification } from "@infra/providers/deepseek/models/deepseek-v4-pro";
import { gpt54Specification } from "@infra/providers/openai/models/gpt-5-4";
import { gpt54MiniSpecification } from "@infra/providers/openai/models/gpt-5-4-mini";
import { gpt54NanoSpecification } from "@infra/providers/openai/models/gpt-5-4-nano";
import { gpt55Specification } from "@infra/providers/openai/models/gpt-5-5";
import { Endpoint } from "@domain/generative-model/endpoint";
import { AnthropicMessagesMapper } from "@infra/providers/anthropic/endpoints/anthropic-messages-mapper";
import { EndpointRequestMapper } from "@domain/generative-model/endpoint-request-mapper";
import { claudeHaiku45Specification } from "@infra/providers/anthropic/models/claude-4-5-haiku";

export type ModelInfo = {
    endpoint: Endpoint;
    mapper: EndpointRequestMapper;
    specification: ModelSpecification;
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
    
    getModelInfo(model: ModelName): ModelInfo {

        switch (model) {
            case "gpt-5-4":
                return { 
                    endpoint: new OpenAIResponses(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: gpt54Specification 
                };
            case "gpt-5-4-mini":
                return { 
                    endpoint: new OpenAIResponses(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: gpt54MiniSpecification 
                };
            case "gpt-5-4-nano":
                return { 
                    endpoint: new OpenAIResponses(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: gpt54NanoSpecification 
                };
            case "gpt-5-5":
                return { 
                    endpoint: new OpenAIResponses(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: gpt55Specification 
                };
            case "claude-4-5-haiku":
                return { 
                    endpoint: new AnthropicMessages(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: claudeHaiku45Specification 
                };
            case "claude-4-6-sonnet":
                return { 
                    endpoint: new AnthropicMessages(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: claudeSonnet46Specification 
                };
            case "claude-4-7-opus":
                return { 
                    endpoint: new AnthropicMessages(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: claudeOpus47Specification 
                };
            case "claude-4-8-opus":
                return { 
                    endpoint: new AnthropicMessages(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: claudeOpus48Specification 
                };
            case "gemini-3-5-flash":
                return { 
                    endpoint: new GeminiGenerateContent(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: gemini35FlashSpecification 
                };
            case "gemini-3-1-pro":
                return { 
                    endpoint: new GeminiGenerateContent(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: gemini31ProSpecification 
                };
            case "deepseek-v4-flash":
                return { 
                    endpoint: new OpenAIChatCompletions(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: deepSeekV4FlashSpecification 
                };
            case "deepseek-v4-pro":
                return { 
                    endpoint: new OpenAIChatCompletions(), 
                    mapper: new AnthropicMessagesMapper(), 
                    specification: deepSeekV4ProSpecification 
                };
            default:
                throw new Error(`Unsupported model: ${model}`);
        }
    }

}
