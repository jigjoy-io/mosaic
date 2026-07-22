import { ContextProjection, WorkingMemory } from "@domain/agentic-environment/agent/memory"
import { InferenceParams, SemanticEvent } from "src"

export class RequestInfereceEvent extends SemanticEvent {
	type = "inference_requested"
	constructor(
		producerId: string,
		occurredAt: Date,
		private readonly inferenceParams: InferenceParams,
	) {
		super(producerId, occurredAt)
	}

	getInferenceParams(): InferenceParams {
		return this.inferenceParams
	}
}

export class RequestInferenceMapping implements ContextProjection<InferenceParams> {
	project(event: RequestInfereceEvent, memory: WorkingMemory): InferenceParams {
		return event.getInferenceParams()
	}
}
