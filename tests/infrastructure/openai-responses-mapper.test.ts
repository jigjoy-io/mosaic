import { describe, it, expect } from "@rstest/core"
import { OpenAIResponsesMapper } from "@infra/providers/openai/endpoints/openai-responses-mapper"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"

function makeParams(
	context: ModelContext,
	overrides: Partial<InferenceParams<ModelName>> = {},
): InferenceParams<ModelName> {
	return {
		model: "gpt-5.4",
		context,
		caller: new BaseParticipant(),
		environment: new AgenticEnvironment(),
		...overrides,
	}
}

describe("OpenAIResponsesMapper.toRequest", () => {
	it("builds a request with model and input", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIResponsesMapper()
		const request = mapper.toRequest(makeParams(context))

		expect(request.model).toBe("gpt-5.4")
		expect(request.input).toHaveLength(1)
		expect(request.input[0]).toEqual({
			type: "message",
			role: "user",
			content: [{ type: "input_text", text: "hi" }],
		})
	})

	it("includes tools when provided", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))
		const tools = [
			{
				type: "function" as const,
				name: "fn",
				description: "desc",
				parameters: {},
				strict: true,
				invoke: async () => ({}),
			},
		]

		const mapper = new OpenAIResponsesMapper()
		const request = mapper.toRequest(makeParams(context, { tools }))

		expect(request.tools).toEqual([{ type: "function", name: "fn", description: "desc", parameters: {} }])
	})

	it("includes reasoning effort", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIResponsesMapper()
		const request = mapper.toRequest(makeParams(context, { reasoningEffort: "medium" }))

		expect(request.reasoning).toEqual({ effort: "medium" })
	})

	it("includes structured output as text.format", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))
		const schema = { type: "object" }

		const mapper = new OpenAIResponsesMapper()
		const request = mapper.toRequest(
			makeParams(context, { structuredOutput: { name: "out", schema, strict: true } }),
		)

		expect(request.text).toEqual({
			format: { type: "json_schema", name: "out", schema: { type: "object" }, strict: true },
		})
	})

	it("sets stream flag when streaming is enabled", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIResponsesMapper()
		const request = mapper.toRequest(makeParams(context, { streaming: true }))

		expect(request.stream).toBe(true)
	})
})

describe("OpenAIResponsesMapper.extractContextItems", () => {
	it("extracts assistant messages from output", () => {
		const mapper = new OpenAIResponsesMapper()
		const items = mapper.extractContextItems({
			output: [{ type: "message", role: "assistant", content: [{ text: "hello" }] }],
		})

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("message")
		expect((items[0] as ModelMessageItem).role).toBe("assistant")
		expect((items[0] as ModelMessageItem).content.text).toBe("hello")
	})

	it("extracts function calls from output", () => {
		const mapper = new OpenAIResponsesMapper()
		const items = mapper.extractContextItems({
			output: [{ type: "function_call", call_id: "c1", name: "read", arguments: '{"x":1}' }],
		})

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("function_call")
		expect((items[0] as FunctionCallItem).callId).toBe("c1")
		expect((items[0] as FunctionCallItem).name).toBe("read")
		expect((items[0] as FunctionCallItem).args).toBe('{"x":1}')
	})

	it("extracts reasoning items with encrypted content and summary", () => {
		const mapper = new OpenAIResponsesMapper()
		const items = mapper.extractContextItems({
			output: [
				{
					type: "reasoning",
					encrypted_content: "enc123",
					summary: [{ text: "I thought about it" }],
				},
			],
		})

		expect(items).toHaveLength(1)
		const reasoning = items[0] as ReasoningItem
		expect(reasoning.type).toBe("reasoning")
		expect(reasoning.encryptedContent).toBe("enc123")
	})

	it("returns empty array when output is absent", () => {
		const mapper = new OpenAIResponsesMapper()
		expect(mapper.extractContextItems({})).toEqual([])
	})
})

describe("OpenAIResponsesMapper.extractTokenUsage", () => {
	it("maps token usage from response", () => {
		const mapper = new OpenAIResponsesMapper()
		const usage = mapper.extractTokenUsage({
			usage: {
				input_tokens: 80,
				output_tokens: 30,
				total_tokens: 110,
				input_tokens_details: { cached_tokens: 20 },
				output_tokens_details: { reasoning_tokens: 8 },
			},
		} as any)

		expect(usage?.inputTokens).toBe(80)
		expect(usage?.outputTokens).toBe(30)
		expect(usage?.totalTokens).toBe(110)
		expect(usage?.inputTokenDetails.cached_tokens).toBe(20)
		expect(usage?.outputTokenDetails.reasoning_tokens).toBe(8)
	})

	it("returns undefined when no usage is present", () => {
		const mapper = new OpenAIResponsesMapper()
		expect(mapper.extractTokenUsage({} as any)).toBeUndefined()
	})
})
