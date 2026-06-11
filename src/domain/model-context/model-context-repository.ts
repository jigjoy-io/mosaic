import type { ModelContext } from "@domain/model-context/model-context"

export interface ModelContextRepository {
	save(context: ModelContext): Promise<void>
	get(id: string): Promise<ModelContext>
	getByProjectId(projectId: string): Promise<ModelContext[]>
}
