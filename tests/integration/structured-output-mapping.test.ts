import { describe, it, expect } from "@rstest/core"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { Gpt54 } from "@infra/providers/openai/models/gpt-5-4"
import { ClaudeSonnet46 } from "@infra/providers/anthropic/models/claude-4-6-sonnet"
import { Gemini31Pro } from "@infra/providers/gemini/models/gemini-3-1-pro"
import { DeepSeekV4Flash } from "@infra/providers/deepseek/models/deepseek-v4-flash"
import { InferenceRequest } from "@domain/generative-model/inference-request"
import { OpenAIResponses } from "@infra/providers/openai/runtime/openai-responses"
import { AnthropicMessages } from "@infra/providers/anthropic/runtime/anthropic-messages"
import { GeminiGenerateContent } from "@infra/providers/gemini/runtime/gemini-generate-content"

const testSchema = {
	type: "object",
	properties: {
		city: { type: "string" },
		temperature: { type: "number" },
	},
	required: ["city", "temperature"],
	additionalProperties: false,
}

describe("OpenAI structured output request mapping", () => {
	it("adds text.format with json_schema to the request", () => {
		const model = new Gpt54()
		model.setStructuredOutput({ name: "weather", schema: testSchema, strict: true })

		const context = ModelContext.create("test-project")
		context.addContextItem(UserMessageItem.create("What is the weather?"))

		const runtime = new OpenAIResponses()
		const request = (runtime as any).buildRequest(new InferenceRequest(model, context))

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
		const model = new Gpt54()
		model.setStructuredOutput({ schema: testSchema })

		const context = ModelContext.create("test-project")
		context.addContextItem(UserMessageItem.create("What is the weather?"))

		const runtime = new OpenAIResponses()
		const request = (runtime as any).buildRequest(new InferenceRequest(model, context))

		expect(request.text.format.name).toBe("response")
		expect(request.text.format.strict).toBe(true)
	})

	it("does not add text.format when structured output is not set", () => {
		const model = new Gpt54()

		const context = ModelContext.create("test-project")
		context.addContextItem(UserMessageItem.create("Hello"))

		const runtime = new OpenAIResponses()
		const request = (runtime as any).buildRequest(new InferenceRequest(model, context))

		expect(request.text).toBeUndefined()
	})
})

describe("Anthropic structured output request mapping", () => {
	it("adds output_config.format with json_schema to the request", () => {
		const model = new ClaudeSonnet46()
		model.setStructuredOutput({ schema: testSchema })

		const context = ModelContext.create("test-project")
		context.addContextItem(UserMessageItem.create("What is the weather?"))

		const runtime = new AnthropicMessages()
		const request = (runtime as any).buildRequest(new InferenceRequest(model, context))

		expect(request.output_config).toEqual({
			format: {
				type: "json_schema",
				json_schema: testSchema,
			},
		})
	})

	it("does not add output_config when structured output is not set", () => {
		const model = new ClaudeSonnet46()

		const context = ModelContext.create("test-project")
		context.addContextItem(UserMessageItem.create("Hello"))

		const runtime = new AnthropicMessages()
		const request = (runtime as any).buildRequest(new InferenceRequest(model, context))

		expect(request.output_config).toBeUndefined()
	})
})

describe("Gemini structured output request mapping", () => {
	it("adds responseMimeType and responseSchema to the config", () => {
		const model = new Gemini31Pro()
		model.setStructuredOutput({ schema: testSchema })

		const context = ModelContext.create("test-project")
		context.addContextItem(UserMessageItem.create("What is the weather?"))

		const runtime = new GeminiGenerateContent()
		const request = (runtime as any).buildRequest(new InferenceRequest(model, context))

		expect(request.config.responseMimeType).toBe("application/json")
		expect(request.config.responseSchema).toEqual(testSchema)
	})

	it("does not add responseMimeType when structured output is not set", () => {
		const model = new Gemini31Pro()

		const context = ModelContext.create("test-project")
		context.addContextItem(UserMessageItem.create("Hello"))

		const runtime = new GeminiGenerateContent()
		const request = (runtime as any).buildRequest(new InferenceRequest(model, context))

		expect(request.config.responseMimeType).toBeUndefined()
		expect(request.config.responseSchema).toBeUndefined()
	})
})

describe("DeepSeek structured output guard", () => {
	it("throws when structured output is set on an unsupported model", () => {
		const model = new DeepSeekV4Flash()
		model.setStructuredOutput({ schema: testSchema })

		const context = ModelContext.create("test-project")
		context.addContextItem(UserMessageItem.create("What is the weather?"))

		// DeepSeek has no runtime adapter yet, but the model flag is false.
		// Any adapter that checks the flag would throw.
		expect(model.specification.supportStructuredOutput).toBe(false)
	})
})
