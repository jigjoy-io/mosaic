import { describe, it, expect } from "@rstest/core"
import { ModelContext } from "@domain/model-context/model-context"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { OpenAIChatCompletionsMapper } from "@infra/providers/openai/endpoints/openai-chat-completions-mapper"
import { AgenticEnvironment } from "@domain/agentic-environment/channel"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"
import type { Tool } from "@domain/generative-model/tool"

function makeParams(
	context: ModelContext,
	overrides: Partial<InferenceParams<ModelName>> = {},
): InferenceParams<ModelName> {
	return {
		model: "gpt-5.5",
		context,
		caller: new BaseParticipant(),
		environment: AgenticEnvironment.create({ name: "test" }),
		...overrides,
	}
}

describe("OpenAIChatCompletionsMapper.mapContextItems", () => {
	it("maps a full conversation into OpenAI chat messages", () => {
		const context = ModelContext.create("project")
		context.addContextItem(SystemMessageItem.create("You are a helpful assistant."))
		context.addContextItem(UserMessageItem.create("What is the weather in NYC?"))
		context.addContextItem(ModelMessageItem.rehydrate({ text: "Let me check." }))
		context.addContextItem(
			FunctionCallItem.rehydrate({
				callId: "call_1",
				name: "get_weather",
				args: JSON.stringify({ city: "NYC" }),
			}),
		)
		context.addContextItem(FunctionCallOutputItem.create("call_1", "Sunny, 22C"))

		const mapper = new OpenAIChatCompletionsMapper()
		const messages = mapper.mapContextItems(makeParams(context))

		expect(messages).toEqual([
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content: "What is the weather in NYC?" },
			{
				role: "assistant",
				content: "Let me check.",
				tool_calls: [
					{
						id: "call_1",
						type: "function",
						function: { name: "get_weather", arguments: JSON.stringify({ city: "NYC" }) },
					},
				],
			},
			{ role: "tool", tool_call_id: "call_1", content: "Sunny, 22C" },
		])
	})

	it("merges consecutive parallel tool calls into ONE assistant message", () => {
		const context = ModelContext.create("project")
		context.addContextItem(UserMessageItem.create("Read two files."))
		context.addContextItem(FunctionCallItem.rehydrate({ callId: "call_a", name: "read", args: '{"path":"a.ts"}' }))
		context.addContextItem(FunctionCallItem.rehydrate({ callId: "call_b", name: "read", args: '{"path":"b.ts"}' }))
		context.addContextItem(FunctionCallOutputItem.create("call_a", "contents of a"))
		context.addContextItem(FunctionCallOutputItem.create("call_b", "contents of b"))

		const mapper = new OpenAIChatCompletionsMapper()
		const messages = mapper.mapContextItems(makeParams(context))

		expect(messages).toEqual([
			{ role: "user", content: "Read two files." },
			{
				role: "assistant",
				content: null,
				tool_calls: [
					{ id: "call_a", type: "function", function: { name: "read", arguments: '{"path":"a.ts"}' } },
					{ id: "call_b", type: "function", function: { name: "read", arguments: '{"path":"b.ts"}' } },
				],
			},
			{ role: "tool", tool_call_id: "call_a", content: "contents of a" },
			{ role: "tool", tool_call_id: "call_b", content: "contents of b" },
		])
	})
})

describe("OpenAIChatCompletionsMapper.toRequest", () => {
	const toolFor = (name: string): Tool => ({
		type: "function",
		name,
		description: `invoke ${name}`,
		parameters: { type: "object", properties: {} },
		strict: true,
		invoke: async () => ({}),
	})

	it("sends model name + messages, and tools when provided", () => {
		const context = ModelContext.create("project").addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context, { tools: [toolFor("read")] }))

		expect(request.model).toBe("gpt-5.5")
		expect(request.messages).toEqual([{ role: "user", content: "hi" }])
		expect(request.tools).toEqual([
			{
				type: "function",
				function: { name: "read", description: "invoke read", parameters: { type: "object", properties: {} } },
			},
		])
	})

	it("omits tools when none are provided", () => {
		const context = ModelContext.create("project").addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context))

		expect(request.tools).toBeUndefined()
	})

	it("emits reasoning_effort when provided", () => {
		const context = ModelContext.create("project").addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context, { reasoningEffort: "high" }))

		expect(request.reasoning_effort).toBe("high")
	})
})

describe("OpenAIChatCompletionsMapper response extraction", () => {
	const mapper = new OpenAIChatCompletionsMapper()

	it("extracts assistant text + tool calls into context items", () => {
		const items = mapper.extractContextItems({
			choices: [
				{
					message: {
						content: "Here you go.",
						tool_calls: [
							{ id: "call_1", type: "function", function: { name: "read", arguments: '{"path":"x"}' } },
						],
					},
				},
			],
		})

		expect(items).toHaveLength(2)
		expect(items[0].type).toBe("message")
		expect((items[0] as any).content.text).toBe("Here you go.")
		expect(items[1].type).toBe("function_call")
		expect((items[1] as any).name).toBe("read")
		expect((items[1] as any).args).toBe('{"path":"x"}')
	})

	it("returns no items for an empty/missing message", () => {
		expect(mapper.extractContextItems({ choices: [] })).toEqual([])
		expect(mapper.extractContextItems({})).toEqual([])
	})

	it("maps token usage into a TokenUsage", () => {
		const usage = mapper.extractTokenUsage({
			usage: {
				prompt_tokens: 100,
				completion_tokens: 40,
				total_tokens: 140,
				prompt_tokens_details: { cached_tokens: 25 },
				completion_tokens_details: { reasoning_tokens: 12 },
			},
		})

		expect(usage?.inputTokens).toBe(100)
		expect(usage?.outputTokens).toBe(40)
		expect(usage?.totalTokens).toBe(140)
		expect(usage?.inputTokenDetails?.cached_tokens).toBe(25)
		expect(usage?.outputTokenDetails?.reasoning_tokens).toBe(12)
	})

	it("returns undefined token usage when the response has none", () => {
		expect(mapper.extractTokenUsage({})).toBeUndefined()
	})
})
