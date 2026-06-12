import { describe, it, expect } from "@rstest/core"
import { InMemoryModelContextRepository } from "@infra/repository/in-memory-model-context-repository"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"

describe("InMemoryModelContextRepository (integration)", () => {
	it("persists a context and returns it by id", async () => {
		const repo = new InMemoryModelContextRepository()
		const context = ModelContext.create("project-1").addContextItem(UserMessageItem.create("hi"))

		await repo.save(context)
		const loaded = await repo.get(context.id)

		expect(loaded.id).toBe(context.id)
		expect(loaded.projectId).toBe("project-1")
		expect(loaded.getItems()).toHaveLength(context.getItems().length)
		expect(loaded.getItems()[0].type).toBe("message")
	})

	it("throws when getting an unknown id", async () => {
		const repo = new InMemoryModelContextRepository()

		await expect(repo.get("nope")).rejects.toThrow("Context not found: nope")
	})

	it("returns a clone, so mutating the saved context after save does not leak", async () => {
		const repo = new InMemoryModelContextRepository()
		const context = ModelContext.create("project-1").addContextItem(UserMessageItem.create("first"))

		await repo.save(context)
		context.addContextItem(UserMessageItem.create("second")) // mutate AFTER save

		const loaded = await repo.get(context.id)
		expect(loaded.getItems()).toHaveLength(1)
	})

	it("indexes contexts by project id", async () => {
		const repo = new InMemoryModelContextRepository()
		const a = ModelContext.create("project-1")
		const b = ModelContext.create("project-1")
		const other = ModelContext.create("project-2")
		await repo.save(a)
		await repo.save(b)
		await repo.save(other)

		const projectOne = await repo.getByProjectId("project-1")

		expect(projectOne.map((c) => c.id).sort()).toEqual([a.id, b.id].sort())
		expect(await repo.getByProjectId("unknown")).toEqual([])
	})

	it("moves a context out of its old project index when re-saved under a new project", async () => {
		const repo = new InMemoryModelContextRepository()
		const context = ModelContext.create("project-1")
		await repo.save(context)

		const moved = ModelContext.rehydrate({ id: context.id, projectId: "project-2", items: [] })
		await repo.save(moved)

		expect(await repo.getByProjectId("project-1")).toEqual([])
		expect((await repo.getByProjectId("project-2")).map((c) => c.id)).toEqual([context.id])
	})
})
