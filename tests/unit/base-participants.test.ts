import { describe, it, expect } from "@rstest/core"
import { BaseHuman } from "@app/participants/human"
import { BaseObserver } from "@app/participants/observer"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { RecordingParticipant } from "../helpers/recording-participant"

describe("BaseHuman", () => {
	it("broadcasts a message to the other participants once joined", () => {
		const env = new AgenticEnvironment()
		const human = new BaseHuman()
		const listener = new RecordingParticipant()
		human.join(env)
		listener.join(env)

		human.sendMessage(env, "hello")

		expect(listener.find("onMessage")).toEqual([{ m: "onMessage", args: ["hello"] }])
	})

	it("refuses to send before joining the environment", () => {
		const env = new AgenticEnvironment()
		const human = new BaseHuman()

		expect(() => human.sendMessage(env, "hello")).toThrow("Not joined to environment")
	})
})

describe("BaseObserver", () => {
	it("joins an environment and absorbs deliveries without throwing", () => {
		const env = new AgenticEnvironment()
		const observer = new BaseObserver()
		const sender = new RecordingParticipant()
		observer.join(env)
		sender.join(env)

		expect(observer.getEnvironments()).toEqual([env])
		expect(() => env.deliverModelMessage(sender, ModelMessageItem.rehydrate({ text: "noted" }))).not.toThrow()
	})
})
