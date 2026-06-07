import { AnthropicMessages } from "@infra/providers/anthropic/endpoints/anthropic-messages"
import { OpenAIResponses } from "@infra/providers/openai/endpoints/openai-responses"
import { GeminiGenerateContent } from "@infra/providers/gemini/endpoints/gemini-generate-content"
import { OpenAIChatCompletions } from "@infra/providers/openai/endpoints/openai-chat-completions"
import { claudeSonnet46Specification } from "@infra/providers/anthropic/models/claude-4-6-sonnet"
import { claudeOpus48Specification } from "@infra/providers/anthropic/models/claude-4-8-opus"
import { claudeOpus47Specification } from "@infra/providers/anthropic/models/claude-4-7-opus"
import { gemini35FlashSpecification } from "@infra/providers/gemini/models/gemini-3-5-flash"
import { gemini31ProSpecification } from "@infra/providers/gemini/models/gemini-3-1-pro"
import { deepSeekV4FlashSpecification } from "@infra/providers/deepseek/models/deepseek-v4-flash"
import { deepSeekV4ProSpecification } from "@infra/providers/deepseek/models/deepseek-v4-pro"
import { gpt54Specification } from "@infra/providers/openai/models/gpt-5-4"
import { gpt54MiniSpecification } from "@infra/providers/openai/models/gpt-5-4-mini"
import { gpt54NanoSpecification } from "@infra/providers/openai/models/gpt-5-4-nano"
import { gpt55Specification } from "@infra/providers/openai/models/gpt-5-5"
import { AnthropicMessagesMapper } from "@infra/providers/anthropic/endpoints/anthropic-messages-mapper"
import { claudeHaiku45Specification } from "@infra/providers/anthropic/models/claude-4-5-haiku"
import { GenerativeModel, ModelName } from "@domain/generative-model/generative-model"
import { OpenAIResponsesMapper } from "@infra/providers/openai/endpoints/openai-responses-mapper"
import { OpenAIChatCompletionsMapper } from "@infra/providers/openai/endpoints/openai-chat-completions-mapper"
import { GeminiGenerateContentMapper } from "@infra/providers/gemini/endpoints/gemini-generate-content-mapper"
import { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"

export class InMemoryGenerativeModelRepository implements GenerativeModelRepository {
	getByModelName(modelName: ModelName): Promise<GenerativeModel> {
		const anthropicMessagesMapper = new AnthropicMessagesMapper()
		const openaiResponsesMapper = new OpenAIResponsesMapper()
		const openaiChatCompletionsMapper = new OpenAIChatCompletionsMapper()
		const geminiGenerateContentMapper = new GeminiGenerateContentMapper()

		let generativeModel = undefined
		switch (modelName) {
			case "gpt-5-4":
				generativeModel = {
					endpoint: new OpenAIResponses(openaiResponsesMapper),
					specification: gpt54Specification,
				}
				break
			case "gpt-5-4-mini":
				generativeModel = {
					endpoint: new OpenAIResponses(openaiResponsesMapper),
					specification: gpt54MiniSpecification,
				}
				break
			case "gpt-5-4-nano":
				generativeModel = {
					endpoint: new OpenAIResponses(openaiResponsesMapper),
					specification: gpt54NanoSpecification,
				}
				break
			case "gpt-5-5":
				generativeModel = {
					endpoint: new OpenAIResponses(openaiResponsesMapper),
					specification: gpt55Specification,
				}
				break
			case "claude-4-5-haiku":
				generativeModel = {
					endpoint: new AnthropicMessages(anthropicMessagesMapper),
					specification: claudeHaiku45Specification,
				}
				break
			case "claude-4-6-sonnet":
				generativeModel = {
					endpoint: new AnthropicMessages(anthropicMessagesMapper),
					specification: claudeSonnet46Specification,
				}
				break
			case "claude-4-7-opus":
				generativeModel = {
					endpoint: new AnthropicMessages(anthropicMessagesMapper),
					specification: claudeOpus47Specification,
				}
				break
			case "claude-4-8-opus":
				generativeModel = {
					endpoint: new AnthropicMessages(anthropicMessagesMapper),
					specification: claudeOpus48Specification,
				}
				break
			case "gemini-3-5-flash":
				generativeModel = {
					endpoint: new GeminiGenerateContent(geminiGenerateContentMapper),
					specification: gemini35FlashSpecification,
				}
				break
			case "gemini-3-1-pro":
				generativeModel = {
					endpoint: new GeminiGenerateContent(geminiGenerateContentMapper),
					specification: gemini31ProSpecification,
				}
				break
			case "deepseek-v4-flash":
				generativeModel = {
					endpoint: new OpenAIChatCompletions(openaiChatCompletionsMapper),
					specification: deepSeekV4FlashSpecification,
				}
				break
			case "deepseek-v4-pro":
				generativeModel = {
					endpoint: new OpenAIChatCompletions(openaiChatCompletionsMapper),
					specification: deepSeekV4ProSpecification,
				}
		}

		if (!generativeModel) {
			throw new Error(`Unsupported model: ${modelName}`)
		}

		return Promise.resolve(generativeModel)
	}
}
