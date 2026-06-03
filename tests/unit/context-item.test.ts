import { describe, it, expect } from "@rstest/core"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { OutputText } from "@domain/model-context/context-item/item-content/output-text"
import { SummaryText } from "@domain/model-context/context-item/item-content/summary-text"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"

describe("item content", () => {
	it("InputText serialises to a single-element input_text array", () => {
		expect(InputText.create("hello").toJSON()).toEqual([{ type: "input_text", text: "hello" }])
	})

	it("InputText.rehydrate preserves the text", () => {
		expect(InputText.rehydrate({ text: "round-trip" }).text).toBe("round-trip")
	})

	it("OutputText serialises to a single-element output_text array", () => {
		expect(OutputText.rehydrate({ text: "out" }).toJSON()).toEqual([{ type: "output_text", text: "out" }])
	})

	it("SummaryText serialises to an object (not an array)", () => {
		expect(SummaryText.rehydrate({ text: "sum" }).toJSON()).toEqual({ type: "summary_text", text: "sum" })
	})
})

describe("client message items", () => {
	it("UserMessageItem carries the user role and wraps the text as input_text", () => {
		const item = UserMessageItem.create("hi")

		expect(item.type).toBe("message")
		expect(item.role).toBe("user")
		expect(item.getType()).toBe("message")
		expect(item.toJSON()).toEqual({
			type: "message",
			role: "user",
			content: [{ type: "input_text", text: "hi" }],
		})
	})

	it("SystemMessageItem carries the system role", () => {
		const item = SystemMessageItem.create("sys")

		expect(item.role).toBe("system")
		expect(item.toJSON()).toEqual({
			type: "message",
			role: "system",
			content: [{ type: "input_text", text: "sys" }],
		})
	})

	it("DeveloperMessageItem carries the developer role", () => {
		const item = DeveloperMessageItem.create("dev")

		expect(item.role).toBe("developer")
		expect(item.toJSON()).toEqual({
			type: "message",
			role: "developer",
			content: [{ type: "input_text", text: "dev" }],
		})
	})

	it("message items rehydrate back to an equivalent item", () => {
		const original = UserMessageItem.create("same")
		const restored = UserMessageItem.rehydrate({ text: "same" })

		expect(restored.toJSON()).toEqual(original.toJSON())
	})

	it("FunctionCallOutputItem serialises call_id and output text", () => {
		const item = FunctionCallOutputItem.create("call_1", "result")

		expect(item.type).toBe("function_call_output")
		expect(item.callId).toBe("call_1")
		expect(item.toJSON()).toEqual({
			type: "function_call_output",
			call_id: "call_1",
			output: [{ type: "input_text", text: "result" }],
		})
	})
})

describe("model output items", () => {
	it("FunctionCallItem maps callId/args to call_id/arguments in JSON", () => {
		const item = FunctionCallItem.rehydrate({ callId: "c1", name: "doThing", args: '{"a":1}' })

		expect(item.type).toBe("function_call")
		expect(item.toJSON()).toEqual({
			type: "function_call",
			call_id: "c1",
			name: "doThing",
			arguments: '{"a":1}',
		})
	})

	it("ModelMessageItem carries the assistant role and wraps output_text", () => {
		const item = ModelMessageItem.rehydrate({ text: "answer" })

		expect(item.role).toBe("assistant")
		expect(item.toJSON()).toEqual({
			type: "message",
			role: "assistant",
			content: [{ type: "output_text", text: "answer" }],
		})
	})

	it("ReasoningItem serialises content, encryptedContent and summary", () => {
		const item = ReasoningItem.rehydrate({
			content: InputText.rehydrate({ text: "because" }),
			encryptedContent: "enc",
			summary: [SummaryText.rehydrate({ text: "tl;dr" })],
		})

		expect(item.type).toBe("reasoning")
		expect(item.toJSON()).toEqual({
			type: "reasoning",
			content: [{ type: "input_text", text: "because" }],
			encryptedContent: "enc",
			summary: [{ type: "summary_text", text: "tl;dr" }],
		})
	})

	it("ReasoningItem tolerates absent content and an empty summary", () => {
		const item = ReasoningItem.rehydrate({
			content: undefined,
			encryptedContent: undefined,
			summary: [],
		})

		expect(item.toJSON()).toEqual({
			type: "reasoning",
			content: undefined,
			encryptedContent: undefined,
			summary: [],
		})
	})
})
