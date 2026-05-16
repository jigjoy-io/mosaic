import { InferenceRunner } from "@domain/agentic-environment/inference-runner"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceRequest } from "@domain/generative-model/inference-request"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { ModelContext } from "@domain/model-context/model-context"
import { AnthropicMessages } from "@infra/providers/anthropic/runtime/anthropic-messages"

type InferenceItem = ReasoningItem | FunctionCallItem | ModelMessageItem

export class AnthropicInferenceRunner implements InferenceRunner {
	private readonly runtime = new AnthropicMessages()

	async *run(context: ModelContext, model: GenerativeModel, signal?: AbortSignal): AsyncIterable<InferenceItem> {
		const response = await this.runtime.infer(new InferenceRequest(model, context))
		for (const item of response.contextItems) {
			yield item as InferenceItem
		}
	}
}
