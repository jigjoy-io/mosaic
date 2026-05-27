import { InferenceRequest } from "@domain/generative-model/inference-request"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

/**
 * Optional streaming companion to {@link ModelRuntime}. Adapters whose
 * provider can stream a round implement this in addition to
 * `ModelRuntime`; runners delegate to `stream` only when the model has
 * streaming enabled and the injected runtime actually implements it.
 */
export interface StreamingRuntime {
	stream(
		request: InferenceRequest,
		signal?: AbortSignal,
	): AsyncIterable<ReasoningItem | FunctionCallItem | ModelMessageItem | SemanticEvent<unknown>>
}
