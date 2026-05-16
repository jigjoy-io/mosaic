import { Context } from "@core/context-runtime/context"
import { ContextItem } from "@core/context-runtime/context-item"
import { DeveloperMessage } from "@core/context-runtime/input/developer-message"
import { FunctionCallOutput } from "@core/context-runtime/input/function-call-output"
import { UserMessage } from "@core/context-runtime/input/user-message"
import { FunctionCall } from "@core/context-runtime/output/function-call"
import { ModelMessage } from "@core/context-runtime/output/model-message"
import { Reasoning } from "@core/context-runtime/output/reasoning"
import { InferenceRequest } from "@core/generative-model/inference-request"
import { InferenceResponse } from "@core/generative-model/inference-response"
import { ModelRuntime } from "@core/generative-model/runtime/model-runtime"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@core/generative-model/token-usage"
import Anthropic from "@anthropic-ai/sdk"

export class AnthropicMessages implements ModelRuntime {
	private readonly client: Anthropic

	constructor() {
		this.client = new Anthropic()
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResponse> {
		const specification = inferenceRequest.model.specification

		const system = this.extractSystem(inferenceRequest.context)
		const messages = this.mapContextToMessages(inferenceRequest.context)

		const request: any = {
			model: specification.name,
			max_tokens: specification.maxOutputTokens,
			messages: messages,
		}

		if (system.length > 0) {
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
			const budget = this.budgetTokensForEffort(effort)
			if (budget !== undefined) {
				request.thinking = {
					type: "enabled",
					budget_tokens: budget,
				}
			}
		}

		const response = await this.client.messages.create(request)

		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
	}

	private budgetTokensForEffort(effort: string): number | undefined {
		switch (effort) {
			case "high":
				return 8000
			case "medium":
				return 4000
			case "low":
				return 2000
			case "none":
				return undefined
			default:
				return undefined
		}
	}

	private extractSystem(context: Context): string {
		return context
			.getItems()
			.filter((item): item is DeveloperMessage => item instanceof DeveloperMessage)
			.map((item) => item.content.text)
			.join("\n")
	}

	private mapContextToMessages(context: Context): any[] {
		const messages: any[] = []
		for (const item of context.getItems()) {
			if (item instanceof DeveloperMessage) {
				continue
			}
			if (item instanceof UserMessage) {
				messages.push({
					role: "user",
					content: [{ type: "text", text: item.content.text }],
				})
				continue
			}
			if (item instanceof ModelMessage) {
				messages.push({
					role: "assistant",
					content: [{ type: "text", text: item.content.text }],
				})
				continue
			}
			if (item instanceof FunctionCall) {
				messages.push({
					role: "assistant",
					content: [
						{
							type: "tool_use",
							id: item.callId,
							name: item.name,
							input: JSON.parse(item.args),
						},
					],
				})
				continue
			}
			if (item instanceof FunctionCallOutput) {
				messages.push({
					role: "user",
					content: [
						{
							type: "tool_result",
							tool_use_id: item.callId,
							content: item.output.text,
						},
					],
				})
				continue
			}
		}
		return messages
	}

	private extractContextItems(response: Anthropic.Messages.Message): ContextItem[] {
		const items: ContextItem[] = []
		for (const block of response.content) {
			if (block.type === "text") {
				items.push(ModelMessage.rehydrate({ text: block.text }))
				continue
			}
			if (block.type === "tool_use") {
				items.push(
					FunctionCall.rehydrate({
						callId: block.id,
						name: block.name,
						args: JSON.stringify(block.input),
					}),
				)
				continue
			}
			if (block.type === "thinking") {
				items.push(
					Reasoning.rehydrate({
						content: undefined,
						encryptedContent: block.thinking,
						summary: [],
					}),
				)
				continue
			}
		}
		return items
	}

	private extractTokenUsage(response: Anthropic.Messages.Message): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		const inputTokens = response.usage.input_tokens
		const outputTokens = response.usage.output_tokens
		const cacheCreation = response.usage.cache_creation_input_tokens ?? 0
		const cacheRead = response.usage.cache_read_input_tokens ?? 0
		return new TokenUsage(
			inputTokens,
			outputTokens,
			inputTokens + outputTokens,
			new InputTokenDetails(cacheCreation + cacheRead),
			new OutputTokenDetails(0),
		)
	}
}
