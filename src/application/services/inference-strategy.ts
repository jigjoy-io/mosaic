import type { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import type { Endpoint } from "@domain/generative-model/endpoint"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"

export interface InferenceStrategy {
	run(request: InferenceParams, endpoint: Endpoint): AsyncIterable<SemanticEvent>
}

export class StreamingInference implements InferenceStrategy {
	async *run(request: InferenceParams, endpoint: Endpoint): AsyncIterable<SemanticEvent> {
		if (request.signal?.aborted) {
			return
		}
		yield* endpoint.stream(request, request.signal)
	}
}

export class NonStreamingInference implements InferenceStrategy {
	async *run(request: InferenceParams, endpoint: Endpoint): AsyncIterable<SemanticEvent> {
		if (request.signal?.aborted) {
			return
		}
		const response = await endpoint.infer(request)
		for (const item of response.contextItems) {
			if (request.signal?.aborted) {
				break
			}
			yield item as SemanticEvent
		}
	}
}
