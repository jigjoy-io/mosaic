import { describe, it, expect } from "@rstest/core"
import { ModelContext } from "@domain/model-context/model-context"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { AnthropicMessagesMapper } from "@infra/providers/anthropic/endpoints/anthropic-messages-mapper"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"

function makeParams(context: ModelContext): InferenceParams<ModelName> {
	return {
		model: "claude-opus-4-7",
		context,
		caller: new BaseParticipant(),
		environment: new AgenticEnvironment(),
		maxOutputTokens: 32_000,
	}
}

describe("AnthropicMessagesMapper.mapContextItems (integration)", () => {
	it("maps a full conversation into Anthropic messages and a system prompt", () => {
		const context = ModelContext.create("integration-project")
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

		const mapper = new AnthropicMessagesMapper()
		const { messages, system } = mapper.mapContextItems(makeParams(context))

		expect(system).toBe("You are a helpful assistant.")

		expect(messages).toEqual([
			{ role: "user", content: [{ type: "text", text: "What is the weather in NYC?" }] },
			{
				role: "assistant",
				content: [
					{ type: "text", text: "Let me check." },
					{ type: "tool_use", id: "call_1", name: "get_weather", input: { city: "NYC" } },
				],
			},
			{ role: "user", content: [{ type: "tool_result", tool_use_id: "call_1", content: "Sunny, 22C" }] },
		])
	})

	it("omits the system prompt when no system or developer message is present", () => {
		const context = ModelContext.create("integration-project")
		context.addContextItem(UserMessageItem.create("Hello"))

		const mapper = new AnthropicMessagesMapper()
		const { messages, system } = mapper.mapContextItems(makeParams(context))

		expect(system).toBeUndefined()
		expect(messages).toEqual([{ role: "user", content: [{ type: "text", text: "Hello" }] }])
	})
})
