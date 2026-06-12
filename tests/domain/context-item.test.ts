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
	it("InputText stores its text and exposes the input_text type", () => {
		const input = InputText.create("hello")

		expect(input.type).toBe("input_text")
		expect(input.text).toBe("hello")
	})

	it("InputText.rehydrate preserves the text", () => {
		expect(InputText.rehydrate({ text: "round-trip" }).text).toBe("round-trip")
	})

	it("OutputText stores its text and exposes the output_text type", () => {
		const output = OutputText.rehydrate({ text: "out" })

		expect(output.type).toBe("output_text")
		expect(output.text).toBe("out")
	})

	it("SummaryText stores its text and exposes the summary_text type", () => {
		const summary = SummaryText.rehydrate({ text: "sum" })

		expect(summary.type).toBe("summary_text")
		expect(summary.text).toBe("sum")
	})
})

describe("client message items", () => {
	it("UserMessageItem carries the user role and wraps the text as input_text", () => {
		const item = UserMessageItem.create("hi")

		expect(item.type).toBe("message")
		expect(item.role).toBe("user")
		expect(item.getType()).toBe("message")
		expect(item.content.type).toBe("input_text")
		expect(item.content.text).toBe("hi")
	})

	it("SystemMessageItem carries the system role", () => {
		const item = SystemMessageItem.create("sys")

		expect(item.role).toBe("system")
		expect(item.content.text).toBe("sys")
	})

	it("DeveloperMessageItem carries the developer role", () => {
		const item = DeveloperMessageItem.create("dev")

		expect(item.role).toBe("developer")
		expect(item.content.text).toBe("dev")
	})

	it("message items rehydrate back to an equivalent item", () => {
		const original = UserMessageItem.create("same")
		const restored = UserMessageItem.rehydrate({ text: "same" })

		expect(restored.content.text).toBe(original.content.text)
		expect(restored.role).toBe(original.role)
		expect(restored.type).toBe(original.type)
	})

	it("FunctionCallOutputItem stores call_id and output text", () => {
		const item = FunctionCallOutputItem.create("call_1", "result")

		expect(item.type).toBe("function_call_output")
		expect(item.callId).toBe("call_1")
		expect(item.output.type).toBe("input_text")
		expect(item.output.text).toBe("result")
	})
})

describe("model output items", () => {
	it("FunctionCallItem stores callId, name, and args", () => {
		const item = FunctionCallItem.rehydrate({ callId: "c1", name: "doThing", args: '{"a":1}' })

		expect(item.type).toBe("function_call")
		expect(item.callId).toBe("c1")
		expect(item.name).toBe("doThing")
		expect(item.args).toBe('{"a":1}')
	})

	it("ModelMessageItem carries the assistant role and wraps output_text", () => {
		const item = ModelMessageItem.rehydrate({ text: "answer" })

		expect(item.role).toBe("assistant")
		expect(item.type).toBe("message")
		expect(item.content.type).toBe("output_text")
		expect(item.content.text).toBe("answer")
	})

	it("ReasoningItem stores content, encryptedContent and summary", () => {
		const item = ReasoningItem.rehydrate({
			content: InputText.rehydrate({ text: "because" }),
			encryptedContent: "enc",
			summary: [SummaryText.rehydrate({ text: "tl;dr" })],
		})

		expect(item.type).toBe("reasoning")
		expect(item.content?.text).toBe("because")
		expect(item.encryptedContent).toBe("enc")
		expect(item.summary).toHaveLength(1)
		expect(item.summary[0].text).toBe("tl;dr")
	})

	it("ReasoningItem tolerates absent content and an empty summary", () => {
		const item = ReasoningItem.rehydrate({
			content: undefined,
			encryptedContent: undefined,
			summary: [],
		})

		expect(item.type).toBe("reasoning")
		expect(item.content).toBeUndefined()
		expect(item.encryptedContent).toBeUndefined()
		expect(item.summary).toEqual([])
	})
})
