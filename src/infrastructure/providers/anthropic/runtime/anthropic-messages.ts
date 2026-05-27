import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { InferenceRequest } from "@domain/generative-model/inference-request"
import { InferenceResponse } from "@domain/generative-model/inference-response"
import { ModelRuntime } from "@domain/generative-model/runtime/model-runtime"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import Anthropic from "@anthropic-ai/sdk"

export class AnthropicMessages implements ModelRuntime {
	private readonly client: Anthropic

	constructor() {
		this.client = new Anthropic()
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResponse> {
		const { messages, system } = this.mapContextToRequest(inferenceRequest.context)

		const specification = inferenceRequest.model.specification

		const request: any = {
			model: specification.name,
			max_tokens: specification.maxOutputTokens,
			messages: messages,
		}

		if (system) {
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
			const effort = inferenceRequest.model.getReasoningEffort()
			const budgets: Record<string, number> = { low: 1_024, medium: 4_096, high: 8_192 }
			const budget = budgets[effort]
			if (budget !== undefined) {
				request.thinking = {
					type: "enabled",
					budget_tokens: Math.min(budget, specification.maxOutputTokens - 1),
				}
			}
		}

		const response = await this.client.messages.create(request)

		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
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

	mapContextToRequest(context: ModelContext): { messages: any[]; system?: string } {
		const messages: any[] = []
		const system: string[] = []

		for (const item of context.getItems()) {
			if (item instanceof DeveloperMessageItem || item instanceof SystemMessageItem) {
				system.push(item.content.text)
				continue
			}

			if (item instanceof UserMessageItem) {
				this.addContentBlock(messages, "user", { type: "text", text: item.content.text })
				continue
			}

			if (item instanceof ModelMessageItem) {
				this.addContentBlock(messages, "assistant", { type: "text", text: item.content.text })
				continue
			}

			if (item instanceof FunctionCallItem) {
				let input: any
				try {
					input = JSON.parse(item.args)
				} catch {
					input = item.args
				}
				this.addContentBlock(messages, "assistant", {
					type: "tool_use",
					id: item.callId,
					name: item.name,
					input: input,
				})
				continue
			}

			if (item instanceof FunctionCallOutputItem) {
				this.addContentBlock(messages, "user", {
					type: "tool_result",
					tool_use_id: item.callId,
					content: item.output.text,
				})
			}
		}

		return {
			messages: messages,
			system: system.length > 0 ? system.join("\n\n") : undefined,
		}
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

	private addContentBlock(messages: any[], role: "user" | "assistant", block: any): void {
		const lastMessage = messages[messages.length - 1]
		if (lastMessage?.role === role) {
			lastMessage.content.push(block)
			return
		}

		messages.push({
			role: role,
			content: [block],
		})
	}
}
