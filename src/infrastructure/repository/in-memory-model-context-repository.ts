import { ModelContext } from "@domain/model-context/model-context"
import type { ModelContextRepository } from "@domain/model-context/model-context-repository"

export class InMemoryModelContextRepository implements ModelContextRepository {
	private readonly store = new Map<string, ModelContext>()
	private readonly projectIndex = new Map<string, Set<string>>()

	async save(context: ModelContext): Promise<void> {
		const existing = this.store.get(context.id)
		if (existing && existing.projectId !== context.projectId) {
			const prevSet = this.projectIndex.get(existing.projectId)
			prevSet?.delete(existing.id)
			if (prevSet && prevSet.size === 0) this.projectIndex.delete(existing.projectId)
		}

		this.store.set(context.id, this.clone(context))

		let set = this.projectIndex.get(context.projectId)
		if (!set) {
			set = new Set<string>()
			this.projectIndex.set(context.projectId, set)
		}
		set.add(context.id)
	}

	async get(id: string): Promise<ModelContext> {
		const context = this.store.get(id)
		if (!context) {
			throw new Error(`Context not found: ${id}`)
		}
		return this.clone(context)
	}

	async getByProjectId(projectId: string): Promise<ModelContext[]> {
		const ids = this.projectIndex.get(projectId)
		if (!ids || ids.size === 0) return []
		return [...ids]
			.map((id) => this.store.get(id))
			.filter((c): c is ModelContext => Boolean(c))
			.map((c) => this.clone(c))
	}

	private clone(context: ModelContext): ModelContext {
		return ModelContext.rehydrate({
			id: context.id,
			projectId: context.projectId,
			items: [...context.getItems()],
		})
	}
}
