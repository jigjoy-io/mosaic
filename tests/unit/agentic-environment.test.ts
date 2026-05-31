import { describe, it, expect } from "@rstest/core"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { Participant } from "@domain/agentic-environment/participants/participant"
import { Human } from "@domain/agentic-environment/participants/human"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

interface Call {
	m: string
	args: unknown[]
}

/** Concrete Participant that records every callback the environment fires at it. */
class RecordingParticipant extends Participant {
	readonly calls: Call[] = []
	private rec(m: string, ...args: unknown[]) {
		this.calls.push({ m, args })
	}
	methods(): string[] {
		return this.calls.map((c) => c.m)
	}
	find(m: string): Call[] {
		return this.calls.filter((c) => c.m === m)
	}

	onParticipantJoined(p: Participant) { this.rec("onParticipantJoined", p) }
	onParticipantLeft(p: Participant) { this.rec("onParticipantLeft", p) }
	onJoined() { this.rec("onJoined") }
	onLeft() { this.rec("onLeft") }
	onFunctionCall(i: FunctionCallItem) { this.rec("onFunctionCall", i) }
	onExternalFunctionCall(s: Participant, i: FunctionCallItem) { this.rec("onExternalFunctionCall", s, i) }
	onFunctionCallOutput(i: FunctionCallOutputItem) { this.rec("onFunctionCallOutput", i) }
	onExternalFunctionCallOutput(s: Participant, i: FunctionCallOutputItem) { this.rec("onExternalFunctionCallOutput", s, i) }
	onReasoning(i: ReasoningItem) { this.rec("onReasoning", i) }
	onExternalReasoning(s: Participant, i: ReasoningItem) { this.rec("onExternalReasoning", s, i) }
	onModelMessage(i: ModelMessageItem) { this.rec("onModelMessage", i) }
	onExternalModelMessage(s: Participant, i: ModelMessageItem) { this.rec("onExternalModelMessage", s, i) }
	onMessage(m: string) { this.rec("onMessage", m) }
	onInternalEvent(i: SemanticEvent<unknown>) { this.rec("onInternalEvent", i) }
	onExternalEvent(s: Participant, i: SemanticEvent<unknown>) { this.rec("onExternalEvent", s, i) }
}

/** Concrete Human used to exercise sendMessage. */
class TestHuman extends Human {
	readonly received: string[] = []
	onParticipantJoined() {}
	onParticipantLeft() {}
	onJoined() {}
	onLeft() {}
	onFunctionCall() {}
	onExternalFunctionCall() {}
	onFunctionCallOutput() {}
	onExternalFunctionCallOutput() {}
	onReasoning() {}
	onExternalReasoning() {}
	onModelMessage() {}
	onExternalModelMessage() {}
	onMessage(message: string) { this.received.push(message) }
	onInternalEvent() {}
	onExternalEvent() {}
}

const aFunctionCall = () => FunctionCallItem.rehydrate({ callId: "c1", name: "fn", args: "{}" })

describe("AgenticEnvironment subscription lifecycle", () => {
	it("fires onJoined on the newcomer and onParticipantJoined on existing members", () => {
		const env = new AgenticEnvironment()
		const first = new RecordingParticipant()
		const second = new RecordingParticipant()

		first.join(env)
		second.join(env)

		// The newcomer learns it joined; it is not told about itself.
		expect(second.methods()).toEqual(["onJoined"])
		// The incumbent is notified that someone joined, with the newcomer as arg.
		expect(first.find("onParticipantJoined")).toEqual([{ m: "onParticipantJoined", args: [second] }])
	})

	it("fires onLeft on the leaver and onParticipantLeft on the remaining members", () => {
		const env = new AgenticEnvironment()
		const a = new RecordingParticipant()
		const b = new RecordingParticipant()
		a.join(env)
		b.join(env)

		b.leave(env)

		expect(b.find("onLeft").length).toBe(1)
		expect(a.find("onParticipantLeft")).toEqual([{ m: "onParticipantLeft", args: [b] }])
	})

	it("unsubscribing a participant that never joined is a no-op", () => {
		const env = new AgenticEnvironment()
		const stranger = new RecordingParticipant()

		env.unsubscribe(stranger)

		expect(stranger.calls).toEqual([])
	})
})

describe("AgenticEnvironment delivery routing", () => {
	it("delivers a function call to its source and as external to everyone else", () => {
		const env = new AgenticEnvironment()
		const source = new RecordingParticipant()
		const other = new RecordingParticipant()
		source.join(env)
		other.join(env)
		const item = aFunctionCall()

		env.deliverFunctionCall(source, item)

		expect(source.find("onFunctionCall")).toEqual([{ m: "onFunctionCall", args: [item] }])
		expect(source.find("onExternalFunctionCall")).toEqual([])
		expect(other.find("onExternalFunctionCall")).toEqual([{ m: "onExternalFunctionCall", args: [source, item] }])
		expect(other.find("onFunctionCall")).toEqual([])
	})

	it("delivers a semantic event internally to the source and externally to others", () => {
		const env = new AgenticEnvironment()
		const source = new RecordingParticipant()
		const other = new RecordingParticipant()
		source.join(env)
		other.join(env)
		const event = new SemanticEvent("ping", { n: 1 })

		env.deliverSemanticEvent(source, event)

		expect(source.find("onInternalEvent")).toEqual([{ m: "onInternalEvent", args: [event] }])
		expect(other.find("onExternalEvent")).toEqual([{ m: "onExternalEvent", args: [source, event] }])
	})

	it("delivers a model message to its source and as external to others", () => {
		const env = new AgenticEnvironment()
		const source = new RecordingParticipant()
		const other = new RecordingParticipant()
		source.join(env)
		other.join(env)
		const item = ModelMessageItem.rehydrate({ text: "hi" })

		env.deliverModelMessage(source, item)

		expect(source.find("onModelMessage")).toEqual([{ m: "onModelMessage", args: [item] }])
		expect(other.find("onExternalModelMessage")).toEqual([{ m: "onExternalModelMessage", args: [source, item] }])
	})

	it("deliverMessage skips the source and notifies everyone else", () => {
		const env = new AgenticEnvironment()
		const source = new RecordingParticipant()
		const other = new RecordingParticipant()
		source.join(env)
		other.join(env)

		env.deliverMessage(source, "broadcast")

		expect(source.find("onMessage")).toEqual([])
		expect(other.find("onMessage")).toEqual([{ m: "onMessage", args: ["broadcast"] }])
	})
})

describe("Participant membership", () => {
	it("join is idempotent and tracks the environment once", () => {
		const env = new AgenticEnvironment()
		const p = new RecordingParticipant()

		p.join(env)
		p.join(env)

		expect(p.getEnvironments()).toEqual([env])
		// onJoined fired exactly once despite the double join.
		expect(p.find("onJoined").length).toBe(1)
	})

	it("leave removes the environment and is a no-op when not joined", () => {
		const env = new AgenticEnvironment()
		const p = new RecordingParticipant()

		p.leave(env) // not joined yet — no-op
		expect(p.find("onLeft").length).toBe(0)

		p.join(env)
		p.leave(env)

		expect(p.getEnvironments()).toEqual([])
		expect(p.find("onLeft").length).toBe(1)
	})
})

describe("Human", () => {
	it("sendMessage throws when the human has not joined the environment", () => {
		const env = new AgenticEnvironment()
		const human = new TestHuman()

		expect(() => human.sendMessage(env, "hello")).toThrow("Not joined to environment")
	})

	it("sendMessage delivers to other participants once joined", () => {
		const env = new AgenticEnvironment()
		const human = new TestHuman()
		const listener = new RecordingParticipant()
		human.join(env)
		listener.join(env)

		human.sendMessage(env, "hello")

		expect(listener.find("onMessage")).toEqual([{ m: "onMessage", args: ["hello"] }])
	})
})
