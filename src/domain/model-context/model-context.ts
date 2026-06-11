import type { ContextItem } from "@domain/model-context/context-item/context-item"

export class ModelContext {
	readonly id: string
	readonly projectId: string
	readonly items: ContextItem[]

	constructor(id: string, projectId: string, items: ContextItem[]) {
		this.projectId = projectId
		this.id = id
		this.items = items
	}

	addContextItem(item: ContextItem): ModelContext {
		this.items.push(item)
		return this
	}

	applyModelOutput(items: ContextItem[]): ModelContext {
		for (const item of items) {
			const itemType = item.getType()
			if (itemType !== "function_call" && itemType !== "message" && itemType !== "reasoning") {
				throw new Error(`Invalid item type: ${itemType}`)
			}
		}
		this.items.push(...items)
		return this
	}

	getItems(): ContextItem[] {
		return this.items
	}

	getLastItem(): ContextItem {
		if (this.items.length === 0) {
			throw new Error("No items in context")
		}
		return this.items[this.items.length - 1]
	}

	static create(projectId: string): ModelContext {
		const id = crypto.randomUUID()
		return new ModelContext(id, projectId, [])
	}

	static rehydrate(data: { id: string; projectId: string; items: ContextItem[] }): ModelContext {
		return new ModelContext(data.id, data.projectId, data.items)
	}
}
