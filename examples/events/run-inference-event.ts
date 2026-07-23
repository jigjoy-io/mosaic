import { EventMapper } from "@domain/agentic-environment/agent/memory"
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

export class RequestInferenceEventMapper implements EventMapper<InferenceParams> {
	map(event: RequestInfereceEvent): InferenceParams {
		return event.getInferenceParams()
	}
}
