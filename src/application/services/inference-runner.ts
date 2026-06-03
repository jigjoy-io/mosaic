import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { ModelContext } from "@domain/model-context/model-context"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InferenceRuntime, SequentialInferenceRuntime, StreamingInferenceRuntime } from "@domain/generative-model/runtime"

type InferenceItem = ReasoningItem | FunctionCallItem | ModelMessageItem | SemanticEvent<unknown>

export class InferenceRunner {

	async *run(context: ModelContext, model: GenerativeModel, runtime: InferenceRuntime, signal?: AbortSignal): AsyncIterable<InferenceItem> {
		const request = new InferenceRequest(model, context)

		if (model.getStreaming() && this.isStreamingRuntime(runtime)) {
			yield* (runtime as StreamingInferenceRuntime).stream(request)
			return
		}

		const response = await (runtime as SequentialInferenceRuntime).infer(request)
		for (const item of response.contextItems) {
			if (signal?.aborted) {
				break
			}
			yield item as InferenceItem
		}
	}

	private isStreamingRuntime(runtime: InferenceRuntime): runtime is StreamingInferenceRuntime {
		return typeof (runtime as Partial<StreamingInferenceRuntime>).stream === "function"
	}
}
