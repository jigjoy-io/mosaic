import { InferenceInput, InferenceOutput } from "@app/states/inference"
import { LoopVisitor, ReceivedMessage } from "./loop-state"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallParams } from "@app/states/function-call"
import { RuntimeService } from "@app/services/runtime"
import { RuntimeState } from "../runtime-state"

export class EventPublisherLoopVisitor implements LoopVisitor {
	constructor(
		private readonly producerId: string,
		private readonly runtime: RuntimeService<RuntimeState>,
	) {}
	visitMessageReceivedStarted(input: ReceivedMessage): void {
		throw new Error("Method not implemented.")
	}
	visitMessageReceivedCompleted(output: InferenceInput): void {
		throw new Error("Method not implemented.")
	}

	visitInferenceStarted(input: InferenceInput): void {
		this.publish("inference.started", input)
	}

	//   visitInferenceEvent(event: InferenceStreamItem): void {
	//     this.publish("inference.stream", event)
	//   }

	visitInferenceCompleted(output: InferenceOutput): void {
		this.publish("inference.completed", output)
	}

	visitFunctionCallStarted(input: FunctionCallParams): void {
		this.publish("function_call.started", input)
	}

	//   visitFunctionCallEvent(
	//     event: FunctionCallStreamItem,
	//   ): void {
	//     this.publish("function_call.stream", event)
	//   }

	visitFunctionCallCompleted(output: FunctionCallOutputItem): void {
		this.publish("function_call.completed", output)
	}

	private publish<TPayload>(type: string, payload: TPayload): void {
		this.runtime.publish({
			type,
			producerId: this.producerId,
			occurredAt: new Date(),
			payload,
		})
	}
}
