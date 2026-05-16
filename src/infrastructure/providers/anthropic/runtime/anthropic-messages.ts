import Anthropic from "@anthropic-ai/sdk"
import { MessageParam, Tool } from "@anthropic-ai/sdk/resources/messages"
import { InferenceRequest } from "@domain/generative-model/inference-request"
import { InferenceResponse } from "@domain/generative-model/inference-response"
import { ModelRuntime } from "@domain/generative-model/runtime/model-runtime"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { ModelContext } from "@domain/model-context/model-context"
import { anthropicReasoningBudgetTokens } from "@infra/providers/anthropic/reasoning-effort"

export class AnthropicMessages implements ModelRuntime {
	private readonly client: Anthropic

	constructor() {
		this.client = new Anthropic()
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResponse> {
		const { messages, system } = this.mapContextToRequest(inferenceRequest.context)
		const specification = inferenceRequest.model.specification
		const request: Anthropic.MessageCreateParamsNonStreaming = {
			model: specification.name,
			max_tokens: specification.maxOutputTokens,
			messages,
		}

		if (system) {
			request.system = system
		}

		if (specification.supportFunctionCalling && inferenceRequest.model.getTools().length > 0) {
			request.tools = inferenceRequest.model.getTools().map((tool) => {
				return {
					name: tool.name,
					description: tool.description,
					input_schema: tool.parameters as Tool.InputSchema,
				}
			})
		}

		if (specification.supportReasoningEffort) {
			const budget = anthropicReasoningBudgetTokens(inferenceRequest.model.getReasoningEffort() as any)
			if (budget) {
				request.thinking = {
					type: "enabled",
					budget_tokens: budget,
				}
			}
		}

		const response = await this.client.messages.create(request)
		return new InferenceResponse(this.extractContextItems(response), this.extractTokenUsage(response))
	}

	private mapContextToRequest(context: ModelContext): { messages: MessageParam[]; system?: string } {
		const systemItems: string[] = []
		const messages: MessageParam[] = []

		for (const item of context.getItems()) {
			if (item instanceof SystemMessageItem || item instanceof DeveloperMessageItem) {
				systemItems.push(item.content.text)
				continue
			}

			if (item instanceof UserMessageItem) {
				messages.push({
					role: "user",
					content: [{ type: "text", text: item.content.text }],
				})
				continue
			}

			if (item instanceof ModelMessageItem) {
				messages.push({
					role: "assistant",
					content: [{ type: "text", text: item.content.text }],
				})
				continue
			}

			if (item instanceof FunctionCallItem) {
				messages.push({
					role: "assistant",
					content: [
						{
							type: "tool_use",
							id: item.callId,
							name: item.name,
							input: this.parseJsonObjectOrFallback(item.args),
						},
					],
				})
				continue
			}

			if (item instanceof FunctionCallOutputItem) {
				messages.push({
					role: "user",
					content: [
						{
							type: "tool_result",
							tool_use_id: item.callId,
							content: item.output.toJSON()[0].text,
						},
					],
				})
			}
		}

		return {
			messages,
			system: systemItems.length > 0 ? systemItems.join("\n\n") : undefined,
		}
	}

	private parseJsonObjectOrFallback(value: string): unknown {
		try {
			return JSON.parse(value)
		} catch {
			return { value }
		}
	}

	private extractContextItems(response: Anthropic.Messages.Message): ContextItem[] {
		return response.content.flatMap((block) => {
			if (block.type === "text") {
				return [ModelMessageItem.rehydrate({ text: block.text })]
			}

			if (block.type === "tool_use") {
				return [
					FunctionCallItem.rehydrate({
						callId: block.id,
						name: block.name,
						args: JSON.stringify(block.input ?? {}),
					}),
				]
			}

			if (block.type === "thinking") {
				return [
					ReasoningItem.rehydrate({
						content: block.thinking ? InputText.rehydrate({ text: block.thinking }) : undefined,
						encryptedContent: "signature" in block ? block.signature : undefined,
						summary: [],
					}),
				]
			}

			return []
		})
	}

	private extractTokenUsage(response: Anthropic.Messages.Message): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}

		const inputTokens = response.usage.input_tokens
		const outputTokens = response.usage.output_tokens
		const cachedTokens =
			(response.usage.cache_creation_input_tokens ?? 0) + (response.usage.cache_read_input_tokens ?? 0)

		return new TokenUsage(
			inputTokens,
			outputTokens,
			inputTokens + outputTokens,
			new InputTokenDetails(cachedTokens),
			new OutputTokenDetails(0),
		)
	}
}
