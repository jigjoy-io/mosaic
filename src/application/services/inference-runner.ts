import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import type { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import type { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import type { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import type { Endpoint } from "@domain/generative-model/endpoint"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"

type InferenceItem = ReasoningItem | FunctionCallItem | ModelMessageItem | SemanticEvent

export interface InferenceRunner {
	run(request: InferenceParams, endpoint: Endpoint): AsyncIterable<InferenceItem>
}

export class StreamingInference implements InferenceRunner {
	async *run(request: InferenceParams, endpoint: Endpoint): AsyncIterable<InferenceItem> {
		if (request.signal?.aborted) {
			return
		}
		yield* endpoint.stream(request, request.signal)
	}
}

export class NonStreamingInference implements InferenceRunner {
	async *run(request: InferenceParams, endpoint: Endpoint): AsyncIterable<InferenceItem> {
		if (request.signal?.aborted) {
			return
		}
		const response = await endpoint.infer(request)
		for (const item of response.contextItems) {
			if (request.signal?.aborted) {
				break
			}
			yield item as InferenceItem
		}
	}
}
