import { ContextItem } from "@domain/model-context/context-item/context-item"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import Anthropic from "@anthropic-ai/sdk"
import { Endpoint } from "@domain/generative-model/endpoint"

export class AnthropicMessages implements Endpoint {
	private readonly client: Anthropic

	constructor() {
		this.client = new Anthropic()
	}

	async infer(inferenceRequest: any): Promise<InferenceResponse> {
		const response = await this.client.messages.create(inferenceRequest)

		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
	}

	async *stream(
		inferenceRequest: any,
		signal?: AbortSignal,
	): AsyncIterable<SemanticEvent<unknown>> {
		const stream: any = await this.client.messages.create({
			...inferenceRequest,
			stream: true,
		})

		for await (const event of stream) {
			if (signal?.aborted) {
				break
			}
			yield new SemanticEvent(event.type, event)
		}
	}

	extractTokenUsage(response: Anthropic.Messages.Message): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		return new TokenUsage(
			response.usage.input_tokens,
			response.usage.output_tokens,
			response.usage.input_tokens + response.usage.output_tokens,
			new InputTokenDetails(
				(response.usage.cache_creation_input_tokens ?? 0) + (response.usage.cache_read_input_tokens ?? 0),
			),
			new OutputTokenDetails(0),
		)
	}

	extractContextItems(response: Anthropic.Messages.Message): ContextItem[] {
		const items: ContextItem[] = []

		for (const block of response.content as any[]) {
			if (block.type === "text") {
				items.push(ModelMessageItem.rehydrate({ text: block.text }))
				continue
			}
			if (block.type === "tool_use") {
				items.push(
					FunctionCallItem.rehydrate({
						callId: block.id,
						name: block.name,
						args: JSON.stringify(block.input ?? {}),
					}),
				)
				continue
			}
			if (block.type === "thinking") {
				items.push(
					ReasoningItem.rehydrate({
						content: block.thinking ? InputText.rehydrate({ text: block.thinking }) : undefined,
						encryptedContent: undefined,
						summary: [],
					}),
				)
			}
		}

		return items
	}

}
