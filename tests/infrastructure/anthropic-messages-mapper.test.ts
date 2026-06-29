import { describe, it, expect } from "@rstest/core"
import { AnthropicMessagesMapper } from "@infra/providers/anthropic/endpoints/anthropic-messages-mapper"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { AgenticEnvironment } from "@domain/agentic-environment/channel"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"

function makeParams(
	context: ModelContext,
	overrides: Partial<InferenceParams<ModelName>> = {},
): InferenceParams<ModelName> {
	return {
		model: "claude-opus-4-7",
		context,
		caller: new BaseParticipant(),
		environment: AgenticEnvironment.create({ name: "test" }),
		maxOutputTokens: 32_000,
		...overrides,
	}
}

describe("AnthropicMessagesMapper.toRequest", () => {
	it("builds a request with model, messages, and max_tokens", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new AnthropicMessagesMapper()
		const request = mapper.toRequest(makeParams(context))

		expect(request.model).toBe("claude-opus-4-7")
		expect(request.max_tokens).toBe(32_000)
		expect(request.messages).toEqual([{ role: "user", content: [{ type: "text", text: "hi" }] }])
	})

	it("includes tools when provided", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))
		const tools = [
			{
				type: "function" as const,
				name: "fn",
				description: "desc",
				parameters: { type: "object" },
				strict: true,
				invoke: async () => ({}),
			},
		]

		const mapper = new AnthropicMessagesMapper()
		const request = mapper.toRequest(makeParams(context, { tools }))

		expect(request.tools).toEqual([{ name: "fn", description: "desc", input_schema: { type: "object" } }])
	})

	it("includes reasoning effort as adaptive thinking config", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new AnthropicMessagesMapper()
		const request = mapper.toRequest(makeParams(context, { reasoningEffort: "high" }))

		expect(request.thinking).toEqual({ type: "adaptive" })
		expect(request.output_config.effort).toBe("high")
	})

	it("includes structured output in output_config", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))
		const schema = { type: "object", properties: { x: { type: "number" } } }

		const mapper = new AnthropicMessagesMapper()
		const request = mapper.toRequest(makeParams(context, { structuredOutput: { schema } }))

		expect(request.output_config.format).toEqual({ type: "json_schema", json_schema: schema })
	})

	it("sets stream flag when streaming is enabled", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new AnthropicMessagesMapper()
		const request = mapper.toRequest(makeParams(context, { streaming: true }))

		expect(request.stream).toBe(true)
	})
})

describe("AnthropicMessagesMapper.extractContextItems", () => {
	it("extracts text blocks as ModelMessageItems", () => {
		const mapper = new AnthropicMessagesMapper()
		const items = mapper.extractContextItems({
			content: [{ type: "text", text: "Hello world" }],
		} as any)

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("message")
		expect((items[0] as ModelMessageItem).role).toBe("assistant")
		expect((items[0] as ModelMessageItem).content.text).toBe("Hello world")
	})

	it("extracts tool_use blocks as FunctionCallItems", () => {
		const mapper = new AnthropicMessagesMapper()
		const items = mapper.extractContextItems({
			content: [{ type: "tool_use", id: "c1", name: "read", input: { path: "x" } }],
		} as any)

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("function_call")
		expect((items[0] as FunctionCallItem).callId).toBe("c1")
		expect((items[0] as FunctionCallItem).name).toBe("read")
		expect((items[0] as FunctionCallItem).args).toBe('{"path":"x"}')
	})

	it("extracts thinking blocks as ReasoningItems", () => {
		const mapper = new AnthropicMessagesMapper()
		const items = mapper.extractContextItems({
			content: [{ type: "thinking", thinking: "let me think", signature: "sig123" }],
		} as any)

		expect(items).toHaveLength(1)
		const reasoning = items[0] as ReasoningItem
		expect(reasoning.type).toBe("reasoning")
		expect(reasoning.encryptedContent).toBe("sig123")
	})
})

describe("AnthropicMessagesMapper.extractTokenUsage", () => {
	it("maps Anthropic usage metadata to TokenUsage", () => {
		const mapper = new AnthropicMessagesMapper()
		const usage = mapper.extractTokenUsage({
			usage: {
				input_tokens: 100,
				output_tokens: 50,
				cache_creation_input_tokens: 10,
				cache_read_input_tokens: 5,
			},
		} as any)

		expect(usage?.inputTokens).toBe(100)
		expect(usage?.outputTokens).toBe(50)
		expect(usage?.totalTokens).toBe(150)
		expect(usage?.inputTokenDetails.cached_tokens).toBe(15)
	})

	it("returns undefined when no usage is present", () => {
		const mapper = new AnthropicMessagesMapper()
		const usage = mapper.extractTokenUsage({} as any)

		expect(usage).toBeUndefined()
	})
})
