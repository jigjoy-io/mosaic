import { describe, it, expect } from "@rstest/core"
import { ModelContext } from "@domain/model-context/model-context"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { GeminiGenerateContent } from "@infra/providers/gemini/runtime/gemini-generate-content"

// Integration: ModelContext ⇄ Gemini generateContent request mapping.
// No network call — only the pure conversion is exercised.
describe("GeminiGenerateContent.mapContextToRequest (integration)", () => {
	it("groups consecutive same-role turns and routes system text to systemInstruction", () => {
		const context = ModelContext.create("integration-project")
		context.addContextItem(SystemMessageItem.create("You are a helpful assistant."))
		context.addContextItem(UserMessageItem.create("What is the weather in NYC?"))
		context.addContextItem(ModelMessageItem.rehydrate({ text: "Let me check." }))
		context.addContextItem(
			FunctionCallItem.rehydrate({ callId: "call_1", name: "get_weather", args: '{"city":"NYC"}' }),
		)
		context.addContextItem(FunctionCallOutputItem.create("call_1", "Sunny, 22C"))

		const { contents, systemInstruction } = new GeminiGenerateContent().mapContextToRequest(context)

		expect(systemInstruction).toBe("You are a helpful assistant.")
		expect(contents).toEqual([
			{ role: "user", parts: [{ text: "What is the weather in NYC?" }] },
			// The model text and the function call share one "model" turn.
			{
				role: "model",
				parts: [
					{ text: "Let me check." },
					{ functionCall: { id: "call_1", name: "get_weather", args: { city: "NYC" } } },
				],
			},
			// A non-JSON tool result is wrapped as { output: <text> }; the call
			// name is recovered from the earlier function call by id.
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

		const { contents } = new GeminiGenerateContent().mapContextToRequest(context)

		expect(contents[1]).toEqual({
			role: "user",
			parts: [{ functionResponse: { id: "c1", name: "lookup", response: { temp: 22, unit: "C" } } }],
		})
	})

	it("omits systemInstruction when there is no system or developer message", () => {
		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("Hello"))

		const { contents, systemInstruction } = new GeminiGenerateContent().mapContextToRequest(context)

		expect(systemInstruction).toBeUndefined()
		expect(contents).toEqual([{ role: "user", parts: [{ text: "Hello" }] }])
	})
})
