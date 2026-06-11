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
import { claudeHaiku45Specification } from "@infra/providers/anthropic/models/claude-4-5-haiku"
import type { GenerativeModel, ModelName } from "@domain/generative-model/generative-model"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"

export class InMemoryGenerativeModelRepository implements GenerativeModelRepository {
	getByModelName(modelName: ModelName): Promise<GenerativeModel> {
		let generativeModel = undefined
		switch (modelName) {
			case "gpt-5.4":
				generativeModel = {
					endpoint: new OpenAIResponses(),
					specification: gpt54Specification,
				}
				break
			case "gpt-5.4-mini":
				generativeModel = {
					endpoint: new OpenAIResponses(),
					specification: gpt54MiniSpecification,
				}
				break
			case "gpt-5.4-nano":
				generativeModel = {
					endpoint: new OpenAIResponses(),
					specification: gpt54NanoSpecification,
				}
				break
			case "gpt-5.5":
				generativeModel = {
					endpoint: new OpenAIResponses(),
					specification: gpt55Specification,
				}
				break
			case "claude-haiku-4-5":
				generativeModel = {
					endpoint: new AnthropicMessages(),
					specification: claudeHaiku45Specification,
				}
				break
			case "claude-sonnet-4-6":
				generativeModel = {
					endpoint: new AnthropicMessages(),
					specification: claudeSonnet46Specification,
				}
				break
			case "claude-opus-4-7":
				generativeModel = {
					endpoint: new AnthropicMessages(),
					specification: claudeOpus47Specification,
				}
				break
			case "claude-opus-4-8":
				generativeModel = {
					endpoint: new AnthropicMessages(),
					specification: claudeOpus48Specification,
				}
				break
			case "gemini-3.5-flash":
				generativeModel = {
					endpoint: new GeminiGenerateContent(),
					specification: gemini35FlashSpecification,
				}
				break
			case "gemini-3.1-pro-preview":
				generativeModel = {
					endpoint: new GeminiGenerateContent(),
					specification: gemini31ProSpecification,
				}
				break
			case "deepseek-v4-flash":
				generativeModel = {
					endpoint: new OpenAIChatCompletions(),
					specification: deepSeekV4FlashSpecification,
				}
				break
			case "deepseek-v4-pro":
				generativeModel = {
					endpoint: new OpenAIChatCompletions(),
					specification: deepSeekV4ProSpecification,
				}
		}

		if (!generativeModel) {
			throw new Error(`Unsupported model: ${modelName}`)
		}

		return Promise.resolve(generativeModel)
	}
}
