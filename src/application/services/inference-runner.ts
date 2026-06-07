import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Endpoint } from "@domain/generative-model/endpoint"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName } from "@domain/generative-model/generative-model"

type InferenceItem = ReasoningItem | FunctionCallItem | ModelMessageItem | SemanticEvent<unknown>

export interface InferenceRunner {
	run(request: InferenceParams<ModelName>, endpoint: Endpoint): AsyncIterable<InferenceItem>
}

export class StreamingInference implements InferenceRunner {
	async *run(request: InferenceParams<ModelName>, endpoint: Endpoint): AsyncIterable<InferenceItem> {
		if (request.signal?.aborted) {
			return
		}
		yield* endpoint.stream(request)
	}
}

export class NonStreamingInference implements InferenceRunner {
	async *run(request: InferenceParams<ModelName>, endpoint: Endpoint): AsyncIterable<InferenceItem> {
		if (request.signal?.aborted) {
			return
		}
		const response = await endpoint.infer(request)
		for (const item of response.contextItems) {
			yield item as InferenceItem
		}
	}
}
