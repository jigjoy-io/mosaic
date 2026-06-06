import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Endpoint } from "@domain/generative-model/endpoint"

type InferenceItem = ReasoningItem | FunctionCallItem | ModelMessageItem | SemanticEvent<unknown>

export class StreamingInference {

	async *run(request: any, endpoint: Endpoint): AsyncIterable<InferenceItem> {
		yield* endpoint.stream(request)
	}
}

export class NonStreamingInference {

	async *run(request: any, endpoint: Endpoint): AsyncIterable<InferenceItem> {
		const response = await endpoint.infer(request)
		for (const item of response.contextItems) {
			yield item as InferenceItem
		}
	}
}
