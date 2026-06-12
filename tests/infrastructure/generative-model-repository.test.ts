import { describe, it, expect } from "@rstest/core"
import { InMemoryGenerativeModelRepository } from "@infra/repository/generative-model-repository"
import { AnthropicMessages } from "@infra/providers/anthropic/endpoints/anthropic-messages"
import { OpenAIResponses } from "@infra/providers/openai/endpoints/openai-responses"
import { OpenAIChatCompletions } from "@infra/providers/openai/endpoints/openai-chat-completions"
import { GeminiGenerateContent } from "@infra/providers/gemini/endpoints/gemini-generate-content"

describe("InMemoryGenerativeModelRepository", () => {
	const repo = new InMemoryGenerativeModelRepository()

	it("returns an OpenAI Responses endpoint for gpt-5.4", async () => {
		const model = await repo.getByModelName("gpt-5.4")

		expect(model.specification.name).toBe("gpt-5.4")
		expect(model.specification.provider).toBe("openai")
		expect(model.endpoint).toBeInstanceOf(OpenAIResponses)
	})

	it("returns an OpenAI Responses endpoint for gpt-5.5", async () => {
		const model = await repo.getByModelName("gpt-5.5")

		expect(model.specification.name).toBe("gpt-5.5")
		expect(model.endpoint).toBeInstanceOf(OpenAIResponses)
	})

	it("returns an Anthropic Messages endpoint for claude-opus-4-7", async () => {
		const model = await repo.getByModelName("claude-opus-4-7")

		expect(model.specification.name).toBe("claude-opus-4-7")
		expect(model.specification.provider).toBe("anthropic")
		expect(model.endpoint).toBeInstanceOf(AnthropicMessages)
	})

	it("returns an Anthropic Messages endpoint for claude-sonnet-4-6", async () => {
		const model = await repo.getByModelName("claude-sonnet-4-6")

		expect(model.specification.name).toBe("claude-sonnet-4-6")
		expect(model.endpoint).toBeInstanceOf(AnthropicMessages)
	})

	it("returns a Gemini endpoint for gemini-3.5-flash", async () => {
		const model = await repo.getByModelName("gemini-3.5-flash")

		expect(model.specification.name).toBe("gemini-3.5-flash")
		expect(model.specification.provider).toBe("google")
		expect(model.endpoint).toBeInstanceOf(GeminiGenerateContent)
	})

	it("returns an OpenAI Chat Completions endpoint for deepseek-v4-flash", async () => {
		const model = await repo.getByModelName("deepseek-v4-flash")

		expect(model.specification.name).toBe("deepseek-v4-flash")
		expect(model.specification.provider).toBe("deepseek")
		expect(model.endpoint).toBeInstanceOf(OpenAIChatCompletions)
	})

	it("throws for an unknown model name", () => {
		expect(() => repo.getByModelName("unknown-model" as any)).toThrow("Unsupported model: unknown-model")
	})
})
