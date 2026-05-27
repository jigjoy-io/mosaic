import { InferenceRunner } from "@domain/agentic-environment/runners/inference-runner"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceRequest } from "@domain/generative-model/inference-request"
import { ModelRuntime } from "@domain/generative-model/runtime/model-runtime"
import { StreamingRuntime } from "@domain/generative-model/runtime/streaming-runtime"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { ModelContext } from "@domain/model-context/model-context"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

type InferenceItem = ReasoningItem | FunctionCallItem | ModelMessageItem | SemanticEvent<unknown>

/**
 * Application-layer inference runner. Provider-agnostic: it depends on
 * the {@link ModelRuntime} domain port and receives a concrete
 * infrastructure adapter (OpenAIResponses, AnthropicMessages, …)
 * through its constructor. The runner never instantiates a provider
 * client itself — wiring happens at the composition root.
 *
 * Name retained for backward compatibility; the runner works with any
 * `ModelRuntime`, not just OpenAI.
 */
export class OpenAIInferenceRunner implements InferenceRunner {
	constructor(private readonly runtime: ModelRuntime) {}

	async *run(context: ModelContext, model: GenerativeModel, signal?: AbortSignal): AsyncIterable<InferenceItem> {
		const request = new InferenceRequest(model, context)

		if (model.getStreaming() && this.isStreamingRuntime(this.runtime)) {
			yield* this.runtime.stream(request, signal)
			return
		}

		const response = await this.runtime.infer(request)
		for (const item of response.contextItems) {
			if (signal?.aborted) {
				break
			}
			yield item as InferenceItem
		}
	}

	private isStreamingRuntime(runtime: ModelRuntime): runtime is ModelRuntime & StreamingRuntime {
		return typeof (runtime as Partial<StreamingRuntime>).stream === "function"
	}
}
