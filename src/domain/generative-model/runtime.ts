import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export abstract class ResponseDeliveryStrategy {

	private deliveryType: "buffering" | "streaming"

	constructor(deliveryType: "buffering" | "streaming") {
		this.deliveryType = deliveryType
	}

	getDeliveryType(): "buffering" | "streaming" {
		return this.deliveryType
	}

}

export class Endpoint {
	private readonly bufferingEndpoint: BufferingEndpoint | undefined
	private readonly streamingEndpoint: StreamingEndpoint | undefined

	constructor(bufferingEndpoint: BufferingEndpoint, streamingEndpoint: StreamingEndpoint) {
		this.bufferingEndpoint = bufferingEndpoint
		this.streamingEndpoint = streamingEndpoint
	}

	infer(request: InferenceRequest): Promise<InferenceResponse> {
		if (!this.bufferingEndpoint) {
			throw new Error("Buffering endpoint not provided")
		}
		return this.bufferingEndpoint.infer(request)
	}

	stream(request: InferenceRequest): AsyncIterable<SemanticEvent<unknown>> {
		if (!this.streamingEndpoint) {
			throw new Error("Streaming endpoint not provided")
		}
		return this.streamingEndpoint.stream(request)
	}
}

export interface BufferingEndpoint {
	infer(request: InferenceRequest): Promise<InferenceResponse>
}

export interface StreamingEndpoint {
	stream(request: InferenceRequest): AsyncIterable<SemanticEvent<unknown>>
}