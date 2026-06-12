import { describe, it, expect } from "@rstest/core"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"

describe("ModelContext", () => {
	it("create() starts with an empty item list and the given project id", () => {
		const context = ModelContext.create("project-1")

		expect(context.projectId).toBe("project-1")
		expect(context.getItems()).toEqual([])
		expect(context.id).toBeTruthy()
	})

	it("addContextItem() appends and returns the same context", () => {
		const context = ModelContext.create("project-1")
		const item = UserMessageItem.create("hello")

		const returned = context.addContextItem(item)

		expect(returned).toBe(context)
		expect(context.getItems()).toEqual([item])
	})

	it("getLastItem() returns the most recently added item", () => {
		const context = ModelContext.create("project-1")
		const first = UserMessageItem.create("first")
		const last = UserMessageItem.create("last")

		context.addContextItem(first).addContextItem(last)

		expect(context.getLastItem()).toBe(last)
	})

	it("getLastItem() throws when the context is empty", () => {
		const context = ModelContext.create("project-1")

		expect(() => context.getLastItem()).toThrow("No items in context")
	})

	it("applyModelOutput() accepts model-emitted item types", () => {
		const context = ModelContext.create("project-1")
		const message = UserMessageItem.create("hi") // type: "message"

		context.applyModelOutput([message])

		expect(context.getItems()).toEqual([message])
	})

	it("applyModelOutput() rejects client-only item types", () => {
		const context = ModelContext.create("project-1")
		const output = FunctionCallOutputItem.create("call_1", "result") // type: "function_call_output"

		expect(() => context.applyModelOutput([output])).toThrow("Invalid item type: function_call_output")
	})
})
