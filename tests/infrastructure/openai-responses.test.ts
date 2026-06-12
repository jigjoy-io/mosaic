import { describe, it, expect } from "@rstest/core"
import { ModelContext } from "@domain/model-context/model-context"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { OpenAIResponsesMapper } from "@infra/providers/openai/endpoints/openai-responses-mapper"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { BaseParticipant } from "@app/participants/participant"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"

function makeParams(context: ModelContext): InferenceParams<ModelName> {
	return {
		model: "gpt-5.4",
		context,
		caller: new BaseParticipant(),
		environment: new AgenticEnvironment(),
	}
}

describe("OpenAIResponsesMapper.mapContextItems (integration)", () => {
	it("serialises each context item to its Responses-API JSON shape", () => {
		const context = ModelContext.create("integration-project")
		context.addContextItem(SystemMessageItem.create("You are a helpful assistant."))
		context.addContextItem(UserMessageItem.create("What is the weather in NYC?"))
		context.addContextItem(ModelMessageItem.rehydrate({ text: "Let me check." }))
		context.addContextItem(
			FunctionCallItem.rehydrate({ callId: "call_1", name: "get_weather", args: '{"city":"NYC"}' }),
		)
		context.addContextItem(FunctionCallOutputItem.create("call_1", "Sunny, 22C"))

		const mapper = new OpenAIResponsesMapper()
		const input = mapper.mapContextItems(makeParams(context))

		expect(input).toEqual([
			{
				type: "message",
				role: "system",
				content: [{ type: "input_text", text: "You are a helpful assistant." }],
			},
			{ type: "message", role: "user", content: [{ type: "input_text", text: "What is the weather in NYC?" }] },
			{ type: "message", role: "assistant", content: [{ type: "output_text", text: "Let me check." }] },
			{ type: "function_call", call_id: "call_1", name: "get_weather", arguments: '{"city":"NYC"}' },
			{ type: "function_call_output", call_id: "call_1", output: [{ type: "input_text", text: "Sunny, 22C" }] },
		])
	})
})

describe("OpenAIResponsesMapper.extractContextItems (integration)", () => {
	it("maps assistant messages and function calls from the Responses output array", () => {
		const mapper = new OpenAIResponsesMapper()
		const items = mapper.extractContextItems({
			output: [
				{ type: "message", role: "assistant", content: [{ text: "Here you go." }] },
				{ type: "function_call", call_id: "call_1", name: "read", arguments: '{"path":"x"}' },
			],
		})

		expect(items).toHaveLength(2)
		expect(items[0].type).toBe("message")
		expect((items[0] as ModelMessageItem).role).toBe("assistant")
		expect((items[0] as ModelMessageItem).content.text).toBe("Here you go.")
		expect(items[1].type).toBe("function_call")
		expect((items[1] as FunctionCallItem).callId).toBe("call_1")
		expect((items[1] as FunctionCallItem).name).toBe("read")
		expect((items[1] as FunctionCallItem).args).toBe('{"path":"x"}')
	})
})
