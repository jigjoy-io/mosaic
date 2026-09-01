import { InferenceInput, InferenceOutput } from "@app/states/inference"
import { ModelMessageParams, ReceivedMessage } from "./loop-state"
import { LoopVisitor } from "./loop-visitor"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallParams } from "@app/states/function-call"
import { RuntimeService } from "@app/services/runtime"
import { RuntimeState } from "../runtime-state"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export class EventPublisherLoopVisitor implements LoopVisitor {
	constructor(
		private readonly agentId: string,
		private readonly runtime: RuntimeService<RuntimeState>,
	) {}

	visitContextPreparationStarted(input: ReceivedMessage): void {
		this.publish("context_preparation.started", input)
	}

	visitContextPreparationCompleted(output: InferenceInput): void {
		this.publish("context_preparation.completed", output)
	}

	visitInferenceStarted(input: InferenceInput): void {
		this.publish("inference.started", input)
	}

	visitInferenceEvent(event: SemanticEvent): void {
		this.publish("inference.stream", event)
	}

	visitInferenceCompleted(output: InferenceOutput): void {
		this.publish("inference.completed", output)
	}

	visitFunctionCallStarted(input: FunctionCallParams): void {
		this.publish("function_call.started", input)
	}

	visitFunctionCallCompleted(output: FunctionCallOutputItem): void {
		this.publish("function_call.completed", output)
	}

	visitModelAnswer(input: ModelMessageParams): void {
		this.publish("model.answer", input)
	}

	private publish<TPayload>(type: string, payload: TPayload): void {
		this.runtime.publish({
			type,
			producerId: this.agentId,
			occurredAt: new Date(),
			payload,
		})
	}
}
