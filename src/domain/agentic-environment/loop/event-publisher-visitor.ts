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
		console.log("Visiting message received started: ", input)
		this.publish("context_preparation.started", input)
	}

	visitContextPreparationCompleted(output: InferenceInput): void {
		console.log("Visiting message received completed: ", output)
		this.publish("context_preparation.completed", output)
	}

	visitInferenceStarted(input: InferenceInput): void {
		console.log("Visiting inference started: ", input)
		this.publish("inference.started", input)
	}

	visitInferenceEvent(event: SemanticEvent): void {
		console.log("Visiting inference event: ", event)
		this.publish("inference.stream", event)
	}

	visitInferenceCompleted(output: InferenceOutput): void {
		console.log("Visiting inference completed: ", output)
		this.publish("inference.completed", output)
	}

	visitFunctionCallStarted(input: FunctionCallParams): void {
		console.log("Visiting function call started: ", input)
		this.publish("function_call.started", input)
	}

	visitFunctionCallCompleted(output: FunctionCallOutputItem): void {
		console.log("Visiting function call completed: ", output)
		this.publish("function_call.completed", output)
	}

	visitModelAnswer(input: ModelMessageParams): void {
		console.log("Visiting model answer: ", input.answer)
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
