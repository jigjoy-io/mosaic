import { describe, it, expect } from "@rstest/core"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { OpenAIResponsesMapper } from "@infra/providers/openai/endpoints/openai-responses-mapper"
import { AnthropicMessagesMapper } from "@infra/providers/anthropic/endpoints/anthropic-messages-mapper"
import { GeminiGenerateContentMapper } from "@infra/providers/gemini/endpoints/gemini-generate-content-mapper"
import { deepSeekV4FlashSpecification } from "@infra/providers/deepseek/models/deepseek-v4-flash"
import { AgenticEnvironment } from "@domain/agentic-environment/channel"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"
import type { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"

const testSchema = {
	type: "object",
	properties: {
		city: { type: "string" },
		temperature: { type: "number" },
	},
	required: ["city", "temperature"],
	additionalProperties: false,
}

function makeParams(model: ModelName, structuredOutput?: StructuredOutputFormat): InferenceParams<ModelName> {
	const context = ModelContext.create("test-project")
	context.addContextItem(UserMessageItem.create("What is the weather?"))
	return {
		model,
		context,
		caller: new BaseParticipant(),
		environment: AgenticEnvironment.create({ name: "test" }),
		maxOutputTokens: 32_000,
		structuredOutput,
	}
}

describe("OpenAI Responses structured output request mapping", () => {
	it("adds text.format with json_schema to the request", () => {
		const mapper = new OpenAIResponsesMapper()
		const request = mapper.toRequest(makeParams("gpt-5.4", { name: "weather", schema: testSchema, strict: true }))

		expect(request.text).toEqual({
			format: {
				type: "json_schema",
				name: "weather",
				schema: testSchema,
				strict: true,
			},
		})
	})

	it("defaults name to 'response' and strict to true when not provided", () => {
		const mapper = new OpenAIResponsesMapper()
		const request = mapper.toRequest(makeParams("gpt-5.4", { schema: testSchema }))

		expect(request.text.format.name).toBe("response")
		expect(request.text.format.strict).toBe(true)
	})

	it("does not add text.format when structured output is not set", () => {
		const mapper = new OpenAIResponsesMapper()
		const request = mapper.toRequest(makeParams("gpt-5.4", undefined))

		expect(request.text).toBeUndefined()
	})
})

describe("Anthropic structured output request mapping", () => {
	it("adds output_config.format with json_schema to the request", () => {
		const mapper = new AnthropicMessagesMapper()
		const request = mapper.toRequest(makeParams("claude-opus-4-7", { schema: testSchema }))

		expect(request.output_config).toEqual({
			format: {
				type: "json_schema",
				json_schema: testSchema,
			},
		})
	})

	it("does not add output_config when structured output is not set", () => {
		const mapper = new AnthropicMessagesMapper()
		const request = mapper.toRequest(makeParams("claude-opus-4-7", undefined))

		expect(request.output_config).toBeUndefined()
	})
})

describe("Gemini structured output request mapping", () => {
	it("adds responseMimeType and responseSchema to the config", () => {
		const mapper = new GeminiGenerateContentMapper()
		const request = mapper.toRequest(makeParams("gemini-3.5-flash", { schema: testSchema }))

		expect(request.config.responseMimeType).toBe("application/json")
		expect(request.config.responseSchema).toEqual(testSchema)
	})

	it("does not add responseMimeType when structured output is not set", () => {
		const mapper = new GeminiGenerateContentMapper()
		const request = mapper.toRequest(makeParams("gemini-3.5-flash", undefined))

		expect(request.config.responseMimeType).toBeUndefined()
		expect(request.config.responseSchema).toBeUndefined()
	})
})

describe("DeepSeek structured output guard", () => {
	it("reports supportsStructuredOutput as false", () => {
		expect(deepSeekV4FlashSpecification.supportsStructuredOutput).toBe(false)
	})
})
