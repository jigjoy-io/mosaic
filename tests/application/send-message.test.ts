import { describe, it, expect } from "@rstest/core"
import { SendMessage } from "@app/use-cases/send-message"
import { BaseParticipant } from "@app/participants/participant"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { RecordingParticipant } from "../helpers/recording-participant"

describe("SendMessage", () => {
	it("broadcasts a message to other participants once the caller has joined", async () => {
		const env = new AgenticEnvironment()
		const caller = new BaseParticipant()
		const listener = new RecordingParticipant()
		caller.join(env)
		listener.join(env)

		const useCase = new SendMessage()
		await useCase.execute(env, "hello", caller)

		expect(listener.find("onMessage")).toEqual([{ m: "onMessage", args: ["hello"] }])
	})

	it("throws when the caller has not joined the environment", async () => {
		const env = new AgenticEnvironment()
		const caller = new BaseParticipant()

		const useCase = new SendMessage()

		await expect(useCase.execute(env, "hello", caller)).rejects.toThrow("Not joined to environment")
	})
})

describe("BaseParticipant", () => {
	it("joins an environment and absorbs deliveries without throwing", () => {
		const env = new AgenticEnvironment()
		const participant = new BaseParticipant()
		const sender = new RecordingParticipant()
		participant.join(env)
		sender.join(env)

		expect(() => env.deliverModelMessage(sender, ModelMessageItem.rehydrate({ text: "noted" }))).not.toThrow()
	})

	it("can leave an environment after joining", () => {
		const env = new AgenticEnvironment()
		const participant = new BaseParticipant()
		participant.join(env)

		expect(participant.isJoinedTo(env)).toBe(true)

		participant.leave(env)

		expect(participant.isJoinedTo(env)).toBe(false)
	})
})
