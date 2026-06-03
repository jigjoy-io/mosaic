import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { ModelContext } from "@domain/model-context/model-context"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ModelInfo } from "@app/use-cases/run-inference"

type InferenceItem = ReasoningItem | FunctionCallItem | ModelMessageItem | SemanticEvent<unknown>

export class InferenceRunner {

	async *run(context: ModelContext, modelInfo: ModelInfo, signal?: AbortSignal): AsyncIterable<InferenceItem> {
		const { model, endpoint } = modelInfo
		const request = new InferenceRequest(model, context)


		if (model.getStreaming()) {
			yield* endpoint.stream(request)
			return
		}

		const response = await endpoint.infer(request)
		for (const item of response.contextItems) {
			if (signal?.aborted) {
				break
			}
			yield item as InferenceItem
		}
	}


}
