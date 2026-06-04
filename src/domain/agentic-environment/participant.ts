import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { AgenticEnvironment } from "./agentic-environment"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgenticError } from "./errors/base-error"

type ParticipantClassConstructor = new (...args: any[]) => Participant

export abstract class Participant {
	private environments: AgenticEnvironment[] = []
	protected listens: ParticipantClassConstructor[] = []
	private active: Map<AgenticEnvironment, boolean> = new Map()

	join(environment: AgenticEnvironment) {
		if (this.isJoinedTo(environment)) {
			return
		}
		environment.subscribe(this)
		this.environments.push(environment)
		this.active.set(environment, true)
	}

	leave(environment: AgenticEnvironment) {
		if (!this.isJoinedTo(environment)) {
			return
		}
		environment.unsubscribe(this)
		this.environments = this.environments.filter((e) => e !== environment)
		this.active.delete(environment)
	}

	isJoinedTo(environment: AgenticEnvironment): boolean {
		return this.environments.includes(environment)
	}

	getEnvironments(): AgenticEnvironment[] {
		return this.environments
	}

	getListeners(): ParticipantClassConstructor[] {
		return this.listens
	}

	getEnvironmentState(environment: AgenticEnvironment) {
		return this.active.get(environment)
	}

	markInactive(environment: AgenticEnvironment) {
		if (this.active.has(environment)) {
			this.active.set(environment, false)
		}
	}

	markActive(environment: AgenticEnvironment) {
		if (this.active.has(environment)) {
			this.active.set(environment, true)
		}
	}

	abstract onParticipantJoined(participant: Participant): Promise<void> | void

	abstract onParticipantLeft(participant: Participant): Promise<void> | void

	abstract onJoined(): Promise<void> | void

	abstract onLeft(): Promise<void> | void

	abstract onFunctionCall(item: FunctionCallItem): Promise<void> | void

	abstract onExternalFunctionCall(source: Participant, item: FunctionCallItem): Promise<void> | void

	abstract onFunctionCallOutput(item: FunctionCallOutputItem): Promise<void> | void

	abstract onExternalFunctionCallOutput(source: Participant, item: FunctionCallOutputItem): Promise<void> | void

	abstract onReasoning(item: ReasoningItem): Promise<void> | void

	abstract onExternalReasoning(source: Participant, item: ReasoningItem): Promise<void> | void

	abstract onModelMessage(item: ModelMessageItem): Promise<void> | void

	abstract onExternalModelMessage(source: Participant, item: ModelMessageItem): Promise<void> | void

	abstract onMessage(message: string): Promise<void> | void

	abstract onInternalEvent(item: SemanticEvent<unknown>): Promise<void> | void

	abstract onExternalEvent(source: Participant, item: SemanticEvent<unknown>): Promise<void> | void

	abstract onError(error: AgenticError): void

	abstract onParticipantError(source: Participant, error: AgenticError): void
}
