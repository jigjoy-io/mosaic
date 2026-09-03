import type { ContextItem } from "@domain/model-context/context-item/context-item"
import { FunctionCallItem } from "./context-item/model-item/function-call"
import { ModelMessageItem } from "./context-item/model-item/model-message"
import { ReasoningItem } from "./context-item/model-item/reasoning"

export type ModelContextItem = ModelMessageItem | FunctionCallItem | ReasoningItem

export class ModelContext {
	readonly id: string
	readonly items: ContextItem[]

	constructor(id: string, items: ContextItem[]) {
		this.id = id
		this.items = items
	}

	getItems(): ContextItem[] {
		return this.items
	}

	addContextItems(contextItems: ContextItem[]): ModelContext {
		this.items.push(...contextItems)
		return this
	}

	addItem(item: ContextItem): ModelContext {
		this.items.push(item)
		return this
	}

	static create(): ModelContext {
		const id = crypto.randomUUID()
		return new ModelContext(id, [])
	}

	static rehydrate(data: { id: string; items: ContextItem[] }): ModelContext {
		return new ModelContext(data.id, data.items)
	}
}
