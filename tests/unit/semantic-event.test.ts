import { describe, it, expect } from "@rstest/core"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

describe("SemanticEvent", () => {
	it("exposes its type and typed payload", () => {
		const event = new SemanticEvent("story_completed", { storyId: "S1", passed: true })

		expect(event.type).toBe("story_completed")
		expect(event.getType()).toBe("story_completed")
		expect(event.data).toEqual({ storyId: "S1", passed: true })
	})

	it("carries arbitrary payload shapes unchanged", () => {
		const payload = [1, 2, 3]
		const event = new SemanticEvent<number[]>("numbers", payload)

		expect(event.data).toBe(payload)
	})
})
