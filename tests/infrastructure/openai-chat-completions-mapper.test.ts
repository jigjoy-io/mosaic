import { describe, it, expect } from "@rstest/core"
import { OpenAIChatCompletionsMapper } from "@infra/providers/openai/endpoints/openai-chat-completions-mapper"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"

function makeParams(
	context: ModelContext,
	overrides: Partial<InferenceParams<ModelName>> = {},
): InferenceParams<ModelName> {
	return {
		model: "gpt-5.5",
		context,
		caller: new BaseParticipant(),
		environment: new AgenticEnvironment(),
		...overrides,
	}
}

describe("OpenAIChatCompletionsMapper.toRequest", () => {
	it("builds a request with model and messages", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context))

		expect(request.model).toBe("gpt-5.5")
		expect(request.messages).toEqual([{ role: "user", content: "hi" }])
	})

	it("maps developer messages to system role", () => {
		const context = ModelContext.create("p")
		context.addContextItem(DeveloperMessageItem.create("you are helpful"))
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context))

		expect(request.messages[0]).toEqual({ role: "system", content: "you are helpful" })
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

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context, { tools }))

		expect(request.tools).toEqual([
			{ type: "function", function: { name: "fn", description: "desc", parameters: { type: "object" } } },
		])
	})

	it("includes reasoning_effort when provided", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context, { reasoningEffort: "high" }))

		expect(request.reasoning_effort).toBe("high")
	})

	it("sets stream flag when streaming is enabled", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context, { streaming: true }))

		expect(request.stream).toBe(true)
	})

	it("omits tools when none are provided", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new OpenAIChatCompletionsMapper()
		const request = mapper.toRequest(makeParams(context))

		expect(request.tools).toBeUndefined()
	})
})

describe("OpenAIChatCompletionsMapper.extractContextItems", () => {
	it("extracts content as ModelMessageItem", () => {
		const mapper = new OpenAIChatCompletionsMapper()
		const items = mapper.extractContextItems({
			choices: [{ message: { content: "hello" } }],
		})

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("message")
		expect((items[0] as ModelMessageItem).role).toBe("assistant")
		expect((items[0] as ModelMessageItem).content.text).toBe("hello")
	})

	it("extracts tool_calls as FunctionCallItems", () => {
		const mapper = new OpenAIChatCompletionsMapper()
		const items = mapper.extractContextItems({
			choices: [
				{
					message: {
						content: null,
						tool_calls: [{ id: "c1", type: "function", function: { name: "fn", arguments: "{}" } }],
					},
				},
			],
		})

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("function_call")
		expect((items[0] as FunctionCallItem).callId).toBe("c1")
		expect((items[0] as FunctionCallItem).name).toBe("fn")
	})

	it("extracts reasoning_content as ReasoningItem", () => {
		const mapper = new OpenAIChatCompletionsMapper()
		const items = mapper.extractContextItems({
			choices: [{ message: { reasoning_content: "thinking...", content: "done" } }],
		})

		expect(items).toHaveLength(2)
		expect(items[0].type).toBe("reasoning")
		expect(items[1].type).toBe("message")
		expect((items[1] as ModelMessageItem).content.text).toBe("done")
	})

	it("returns empty when choices are empty", () => {
		const mapper = new OpenAIChatCompletionsMapper()
		expect(mapper.extractContextItems({ choices: [] })).toEqual([])
		expect(mapper.extractContextItems({})).toEqual([])
	})
})

describe("OpenAIChatCompletionsMapper.extractTokenUsage", () => {
	it("maps prompt and completion tokens", () => {
		const mapper = new OpenAIChatCompletionsMapper()
		const usage = mapper.extractTokenUsage({
			usage: {
				prompt_tokens: 50,
				completion_tokens: 20,
				total_tokens: 70,
				prompt_tokens_details: { cached_tokens: 10 },
				completion_tokens_details: { reasoning_tokens: 5 },
			},
		})

		expect(usage?.inputTokens).toBe(50)
		expect(usage?.outputTokens).toBe(20)
		expect(usage?.totalTokens).toBe(70)
		expect(usage?.inputTokenDetails.cached_tokens).toBe(10)
		expect(usage?.outputTokenDetails.reasoning_tokens).toBe(5)
	})

	it("returns undefined when no usage is present", () => {
		const mapper = new OpenAIChatCompletionsMapper()
		expect(mapper.extractTokenUsage({})).toBeUndefined()
	})
})
