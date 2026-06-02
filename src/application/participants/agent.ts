import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { Participant } from "@domain/agentic-environment/participants/participant"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelContext } from "@domain/model-context/model-context"
import { InferenceRunner } from "@domain/agentic-environment/runners/inference-runner"
import { FunctionCallRunner } from "@domain/agentic-environment/runners/function-call-runner"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { Agent } from "@domain/agentic-environment/participants/agent"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgenticError } from "@domain/agentic-environment/errors/base-error"

export class BaseAgent extends Agent {
	private inferenceRunner: InferenceRunner
	private functionCallRunner: FunctionCallRunner

	constructor(inferenceRunner: InferenceRunner, functionCallRunner: FunctionCallRunner) {
		super()
		this.inferenceRunner = inferenceRunner
		this.functionCallRunner = functionCallRunner
	}

	onJoined() { }

	onLeft() { }

	onParticipantJoined(participant: Participant) { }

	onParticipantLeft(participant: Participant) { }

	onFunctionCall(item: FunctionCallItem) { }

	onExternalFunctionCall(source: Participant, item: FunctionCallItem) { }

	onFunctionCallOutput(item: FunctionCallOutputItem) { }

	onExternalFunctionCallOutput(source: Participant, item: FunctionCallOutputItem) { }

	onReasoning(item: ReasoningItem) { }

	onExternalReasoning(source: Participant, item: ReasoningItem) { }

	onModelMessage(item: ModelMessageItem) { }

	onExternalModelMessage(source: Participant, item: ModelMessageItem) { }

	onMessage(message: string) { }

	onInternalEvent(item: SemanticEvent<unknown>) { }

	onExternalEvent(source: Participant, item: SemanticEvent<unknown>) { }

	onError(error: AgenticError): void { }

	onParticipantError(source: Participant, error: AgenticError): void { }

	async executeFunctionCall(
		environment: AgenticEnvironment,
		functionCallItem: FunctionCallItem,
		signal?: AbortSignal,
	): Promise<void> {
		if (!this.isJoinedTo(environment)) return

		const stream = this.functionCallRunner.run(functionCallItem, signal)

		for await (const item of stream) {
			environment.deliverFunctionCallOutput(this, item)
		}
	}

	async runInference(
		environment: AgenticEnvironment,
		context: ModelContext,
		model: GenerativeModel,
		signal?: AbortSignal,
	): Promise<void> {
		if (!this.isJoinedTo(environment)) return

		const stream = this.inferenceRunner.run(context, model, signal)

		for await (const item of stream) {
			if (item instanceof ReasoningItem) {
				environment.deliverReasoning(this, item)
			} else if (item instanceof FunctionCallItem) {
				environment.deliverFunctionCall(this, item)
			} else if (item instanceof ModelMessageItem) {
				environment.deliverModelMessage(this, item)
			} else if (item instanceof SemanticEvent) {
				environment.deliverSemanticEvent(this, item)
			}
		}
	}
}
