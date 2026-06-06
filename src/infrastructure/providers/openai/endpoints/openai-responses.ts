import { ContextItem } from "@domain/model-context/context-item/context-item"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import { Endpoint } from "@domain/generative-model/endpoint"
import OpenAI from "openai"

export class OpenAIResponses implements Endpoint {
	private readonly client: OpenAI

	constructor() {
		this.client = new OpenAI()
	}

	async infer(request: any): Promise<InferenceResponse> {

		const response = await this.client.responses.create(request)

		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
	}

	async *stream(
		request: any,
		signal?: AbortSignal,
	): AsyncIterable<SemanticEvent<unknown>> {

		const response: any = await this.client.responses.create(request)

		for await (const event of response) {
			if (signal?.aborted) {
				break
			}
			yield new SemanticEvent(event.type, event)
		}
	}

	extractTokenUsage(response: OpenAI.Responses.Response): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		return new TokenUsage(
			response.usage.input_tokens,
			response.usage.output_tokens,
			response.usage.total_tokens,
			new InputTokenDetails(response.usage.input_tokens_details.cached_tokens),
			new OutputTokenDetails(response.usage.output_tokens_details.reasoning_tokens),
		)
	}

	extractContextItems(response: any): ContextItem[] {
		return response.output.map((item: any) => {
			if (item.type === "message" && item.role === "assistant") {
				return ModelMessageItem.rehydrate(item.content[0] as { text: string })
			}
			if (item.type === "function_call") {
				return FunctionCallItem.rehydrate({
					callId: item.call_id,
					name: item.name,
					args: item.arguments,
				})
			}
			if (item.type === "reasoning") {
				return ReasoningItem.rehydrate(item)
			}
		})
	}
}
