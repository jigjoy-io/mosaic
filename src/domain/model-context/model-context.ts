import type { ContextItem } from "@domain/model-context/context-item/context-item"
import { FunctionCallItem } from "./context-item/model-item/function-call"
import { FunctionCallOutputItem } from "./context-item/client-item/function-call-output"
import { ModelMessageItem } from "./context-item/model-item/model-message"
import { ReasoningItem } from "./context-item/model-item/reasoning"
import { UserMessageItem } from "./context-item/client-item/user-message"
import { DeveloperMessageItem } from "./context-item/client-item/developer-message"

export type ModelContextItem = ModelMessageItem | FunctionCallItem | ReasoningItem

export class ModelContext {
	readonly id: string
	readonly items: ContextItem[]

	constructor(id: string, items: ContextItem[]) {
		this.id = id
		this.items = items
	}

	addUserMessage(message: string): ModelContext {
		const lastItem = this.getLastItem()
		if (lastItem?.getType() === "function_call") {
			throw new Error("To add a user message, the last item must not be a function call")
		}

		this.items.push(UserMessageItem.create(message))
		return this
	}

	addDeveloperMessage(message: string): ModelContext {
		this.items.push(DeveloperMessageItem.create(message))
		return this
	}

	applyModelOutput(items: ContextItem[]): ModelContext {
		this.items.push(...items)
		return this
	}

	getItems(): ContextItem[] {
		return this.items
	}

	addFunctionCallOutput(output: string): ModelContext {
		const lastItem = this.getLastItem() as FunctionCallItem
		if (lastItem?.getType() !== "function_call") {
			throw new Error("To add a function call output, the last item must be a function call")
		}

		this.items.push(FunctionCallOutputItem.create(lastItem.callId, output))
		return this
	}

	private getLastItem(): ContextItem {
		if (this.items.length === 0) {
			throw new Error("No items in context")
		}
		return this.items[this.items.length - 1]
	}

	static create(): ModelContext {
		const id = crypto.randomUUID()
		return new ModelContext(id, [])
	}

	static rehydrate(data: { id: string; items: ContextItem[] }): ModelContext {
		return new ModelContext(data.id, data.items)
	}
}
