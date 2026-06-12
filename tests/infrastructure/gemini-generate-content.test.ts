import { describe, it, expect } from "@rstest/core"
import { ModelContext } from "@domain/model-context/model-context"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { GeminiGenerateContentMapper } from "@infra/providers/gemini/endpoints/gemini-generate-content-mapper"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"

function makeParams(context: ModelContext): InferenceParams<ModelName> {
	return {
		model: "gemini-3.5-flash",
		context,
		caller: new BaseParticipant(),
		environment: new AgenticEnvironment(),
	}
}

describe("GeminiGenerateContentMapper.mapContextItems (integration)", () => {
	it("groups consecutive same-role turns and routes system text to systemInstruction", () => {
		const context = ModelContext.create("integration-project")
		context.addContextItem(SystemMessageItem.create("You are a helpful assistant."))
		context.addContextItem(UserMessageItem.create("What is the weather in NYC?"))
		context.addContextItem(ModelMessageItem.rehydrate({ text: "Let me check." }))
		context.addContextItem(
			FunctionCallItem.rehydrate({ callId: "call_1", name: "get_weather", args: '{"city":"NYC"}' }),
		)
		context.addContextItem(FunctionCallOutputItem.create("call_1", "Sunny, 22C"))

		const mapper = new GeminiGenerateContentMapper()
		const { contents, systemInstruction } = mapper.mapContextItems(makeParams(context))

		expect(systemInstruction).toBe("You are a helpful assistant.")
		expect(contents).toEqual([
			{ role: "user", parts: [{ text: "What is the weather in NYC?" }] },
			{
				role: "model",
				parts: [
					{ text: "Let me check." },
					{ functionCall: { id: "call_1", name: "get_weather", args: { city: "NYC" } } },
				],
			},
			{
				role: "user",
				parts: [
					{ functionResponse: { id: "call_1", name: "get_weather", response: { output: "Sunny, 22C" } } },
				],
			},
		])
	})

	it("parses a JSON tool result into the functionResponse payload", () => {
		const context = ModelContext.create("p")
		context.addContextItem(FunctionCallItem.rehydrate({ callId: "c1", name: "lookup", args: "{}" }))
		context.addContextItem(FunctionCallOutputItem.create("c1", '{"temp":22,"unit":"C"}'))

		const mapper = new GeminiGenerateContentMapper()
		const { contents } = mapper.mapContextItems(makeParams(context))

		expect(contents[1]).toEqual({
			role: "user",
			parts: [{ functionResponse: { id: "c1", name: "lookup", response: { temp: 22, unit: "C" } } }],
		})
	})

	it("omits systemInstruction when there is no system or developer message", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("Hello"))

		const mapper = new GeminiGenerateContentMapper()
		const { contents, systemInstruction } = mapper.mapContextItems(makeParams(context))

		expect(systemInstruction).toBeUndefined()
		expect(contents).toEqual([{ role: "user", parts: [{ text: "Hello" }] }])
	})
})
