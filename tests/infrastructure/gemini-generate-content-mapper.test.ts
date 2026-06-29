import { describe, it, expect } from "@rstest/core"
import { GeminiGenerateContentMapper } from "@infra/providers/gemini/endpoints/gemini-generate-content-mapper"
import { ModelContext } from "@domain/model-context/model-context"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { AgenticEnvironment } from "@domain/agentic-environment/channel"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"

function makeParams(
	context: ModelContext,
	overrides: Partial<InferenceParams<ModelName>> = {},
): InferenceParams<ModelName> {
	return {
		model: "gemini-3.5-flash",
		context,
		caller: new BaseParticipant(),
		environment: AgenticEnvironment.create({ name: "test" }),
		...overrides,
	}
}

describe("GeminiGenerateContentMapper.toRequest", () => {
	it("builds a request with model, contents, and config", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new GeminiGenerateContentMapper()
		const request = mapper.toRequest(makeParams(context))

		expect(request.model).toBe("gemini-3.5-flash")
		expect(request.contents).toEqual([{ role: "user", parts: [{ text: "hi" }] }])
	})

	it("routes system messages to systemInstruction in config", () => {
		const context = ModelContext.create("p")
		context.addContextItem(SystemMessageItem.create("be helpful"))
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new GeminiGenerateContentMapper()
		const request = mapper.toRequest(makeParams(context))

		expect(request.config.systemInstruction).toBe("be helpful")
	})

	it("includes tools as functionDeclarations", () => {
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

		const mapper = new GeminiGenerateContentMapper()
		const request = mapper.toRequest(makeParams(context, { tools }))

		expect(request.config.tools).toEqual([
			{ functionDeclarations: [{ name: "fn", description: "desc", parametersJsonSchema: { type: "object" } }] },
		])
	})

	it("includes reasoning effort as thinkingConfig", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new GeminiGenerateContentMapper()
		const request = mapper.toRequest(makeParams(context, { reasoningEffort: "high" }))

		expect(request.config.thinkingConfig).toEqual({ thinkingLevel: "high", includeThoughts: true })
	})

	it("includes structured output as responseMimeType and responseSchema", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))
		const schema = { type: "object", properties: { x: { type: "number" } } }

		const mapper = new GeminiGenerateContentMapper()
		const request = mapper.toRequest(makeParams(context, { structuredOutput: { schema } }))

		expect(request.config.responseMimeType).toBe("application/json")
		expect(request.config.responseSchema).toEqual(schema)
	})

	it("sets stream flag when streaming is enabled", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		const mapper = new GeminiGenerateContentMapper()
		const request = mapper.toRequest(makeParams(context, { streaming: true }))

		expect(request.stream).toBe(true)
	})
})

describe("GeminiGenerateContentMapper.extractContextItems", () => {
	it("extracts text parts as ModelMessageItems", () => {
		const mapper = new GeminiGenerateContentMapper()
		const items = mapper.extractContextItems({
			candidates: [{ content: { parts: [{ text: "hello" }] } }],
		})

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("message")
		expect((items[0] as ModelMessageItem).role).toBe("assistant")
		expect((items[0] as ModelMessageItem).content.text).toBe("hello")
	})

	it("extracts thought parts as ReasoningItems", () => {
		const mapper = new GeminiGenerateContentMapper()
		const items = mapper.extractContextItems({
			candidates: [{ content: { parts: [{ thought: true, text: "thinking..." }] } }],
		})

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("reasoning")
	})

	it("extracts functionCall parts as FunctionCallItems", () => {
		const mapper = new GeminiGenerateContentMapper()
		const items = mapper.extractContextItems({
			candidates: [{ content: { parts: [{ functionCall: { id: "c1", name: "fn", args: { x: 1 } } }] } }],
		})

		expect(items).toHaveLength(1)
		expect(items[0].type).toBe("function_call")
		expect((items[0] as FunctionCallItem).callId).toBe("c1")
		expect((items[0] as FunctionCallItem).name).toBe("fn")
	})

	it("returns empty array when no candidates are present", () => {
		const mapper = new GeminiGenerateContentMapper()
		expect(mapper.extractContextItems({})).toEqual([])
		expect(mapper.extractContextItems({ candidates: [] })).toEqual([])
	})
})

describe("GeminiGenerateContentMapper.extractTokenUsage", () => {
	it("maps Gemini usage metadata", () => {
		const mapper = new GeminiGenerateContentMapper()
		const usage = mapper.extractTokenUsage({
			usageMetadata: {
				promptTokenCount: 100,
				candidatesTokenCount: 50,
				totalTokenCount: 150,
				cachedContentTokenCount: 20,
				thoughtsTokenCount: 10,
			},
		})

		expect(usage?.inputTokens).toBe(100)
		expect(usage?.outputTokens).toBe(50)
		expect(usage?.totalTokens).toBe(150)
		expect(usage?.inputTokenDetails.cached_tokens).toBe(20)
		expect(usage?.outputTokenDetails.reasoning_tokens).toBe(10)
	})

	it("returns undefined when no usage metadata is present", () => {
		const mapper = new GeminiGenerateContentMapper()
		expect(mapper.extractTokenUsage({})).toBeUndefined()
	})
})
