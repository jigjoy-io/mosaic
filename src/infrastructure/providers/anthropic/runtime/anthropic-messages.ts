import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { InferenceRequest } from "@domain/generative-model/inference-request"
import { InferenceResponse } from "@domain/generative-model/inference-response"
import { ModelRuntime } from "@domain/generative-model/runtime/model-runtime"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import {
	anthropicReasoningEffortToBudgetTokens,
	AnthropicReasoningEffortType,
} from "@infra/providers/anthropic/reasoning-effort"
import Anthropic from "@anthropic-ai/sdk"

export class AnthropicMessages implements ModelRuntime {
	private readonly client: Anthropic
	constructor() {
		this.client = new Anthropic()
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResponse> {
		const { system, messages } = this.mapContextToRequest(inferenceRequest.context)

		const specification = inferenceRequest.model.specification

		let request: any = {
			model: specification.name,
			max_tokens: specification.maxOutputTokens,
			messages,
		}

		if (system !== undefined) {
			request.system = system
		}

		if (specification.supportFunctionCalling && inferenceRequest.model.getTools().length > 0) {
			request.tools = inferenceRequest.model.getTools().map((tool) => {
				return {
					name: tool.name,
					description: tool.description,
					input_schema: tool.parameters,
				}
			})
		}

		if (specification.supportReasoningEffort) {
			const effort = inferenceRequest.model.getReasoningEffort() as AnthropicReasoningEffortType
			request.thinking = {
				type: "enabled",
				budget_tokens: anthropicReasoningEffortToBudgetTokens(effort),
			}
		}

		const response = await this.client.messages.create(request)

		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
	}

	extractTokenUsage(response: any): TokenUsage | undefined {
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

	mapContextToRequest(context: ModelContext): { system: string | undefined; messages: any[] } {
		let system: string | undefined = undefined
		const messages: any[] = []

		for (const item of context.getItems()) {
			const type = item.getType()
			const data = item as any

			if (type === "message" && data.role === "system") {
				system = data.content.text
				continue
			}
			if (type === "message" && (data.role === "user" || data.role === "developer")) {
				messages.push({
					role: "user",
					content: [{ type: "text", text: data.content.text }],
				})
				continue
			}
			if (type === "message" && data.role === "assistant") {
				messages.push({
					role: "assistant",
					content: [{ type: "text", text: data.content.text }],
				})
				continue
			}
			if (type === "function_call") {
				const fc = item as FunctionCallItem
				messages.push({
					role: "assistant",
					content: [
						{
							type: "tool_use",
							id: fc.callId,
							name: fc.name,
							input: fc.args ? JSON.parse(fc.args) : {},
						},
					],
				})
				continue
			}
			if (type === "function_call_output") {
				messages.push({
					role: "user",
					content: [
						{
							type: "tool_result",
							tool_use_id: data.callId,
							content: data.output.text,
						},
					],
				})
				continue
			}
			if (type === "reasoning") {
				const r = item as ReasoningItem
				messages.push({
					role: "assistant",
					content: [
						{
							type: "thinking",
							thinking: r.content?.text ?? "",
							signature: r.encryptedContent ?? "",
						},
					],
				})
				continue
			}
		}

		return { system, messages }
	}

	extractContextItems(response: any): ContextItem[] {
		const items: ContextItem[] = []
		for (const block of response.content) {
			if (block.type === "text") {
				items.push(ModelMessageItem.rehydrate({ text: block.text }))
			} else if (block.type === "tool_use") {
				items.push(
					FunctionCallItem.rehydrate({
						callId: block.id,
						name: block.name,
						args: JSON.stringify(block.input ?? {}),
					}),
				)
			} else if (block.type === "thinking") {
				items.push(
					ReasoningItem.rehydrate({
						content: InputText.rehydrate({ text: block.thinking ?? "" }),
						encryptedContent: block.signature,
						summary: [],
					}),
				)
			}
		}
		return items
	}
}
