import { Participant } from "@domain/agentic-environment/participant"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgenticError } from "src"
import { ParticipantProfile } from "@domain/agentic-environment/participant-profile"

export interface RecordedCall {
	m: string
	args: unknown[]
}

/**
 * Concrete Participant that records every callback the environment fires at
 * it. Shared by application-layer tests that need to observe what an agent
 * delivers onto the bus. (Not a `*.test.ts` file, so rstest does not run it
 * as a suite.)
 */
export class RecordingParticipant extends Participant {
	readonly calls: RecordedCall[] = []
	private rec(m: string, ...args: unknown[]) {
		this.calls.push({ m, args })
	}
	find(m: string): RecordedCall[] {
		return this.calls.filter((c) => c.m === m)
	}

	onParticipantJoined(profile: ParticipantProfile) {
		this.rec("onParticipantJoined", profile)
	}
	onParticipantLeft(profile: ParticipantProfile) {
		this.rec("onParticipantLeft", profile)
	}
	onJoined() {
		this.rec("onJoined")
	}
	onLeft() {
		this.rec("onLeft")
	}
	onFunctionCall(i: FunctionCallItem) {
		this.rec("onFunctionCall", i)
	}
	onExternalFunctionCall(s: Participant, i: FunctionCallItem) {
		this.rec("onExternalFunctionCall", s, i)
	}
	onFunctionCallOutput(i: FunctionCallOutputItem) {
		this.rec("onFunctionCallOutput", i)
	}
	onExternalFunctionCallOutput(s: Participant, i: FunctionCallOutputItem) {
		this.rec("onExternalFunctionCallOutput", s, i)
	}
	onReasoning(i: ReasoningItem) {
		this.rec("onReasoning", i)
	}
	onExternalReasoning(s: Participant, i: ReasoningItem) {
		this.rec("onExternalReasoning", s, i)
	}
	onModelMessage(i: ModelMessageItem) {
		this.rec("onModelMessage", i)
	}
	onExternalModelMessage(s: Participant, i: ModelMessageItem) {
		this.rec("onExternalModelMessage", s, i)
	}
	onMessage(m: string) {
		this.rec("onMessage", m)
	}
	onInternalEvent(i: SemanticEvent<unknown>) {
		this.rec("onInternalEvent", i)
	}
	onExternalEvent(s: Participant, i: SemanticEvent<unknown>) {
		this.rec("onExternalEvent", s, i)
	}
	onError(error: AgenticError): void {
		this.rec("onError", error)
	}
	onParticipantError(source: Participant, error: AgenticError): void {
		this.rec("onParticipantError", source, error)
	}
}
