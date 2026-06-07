import { ModelName } from "@domain/generative-model/generative-model"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import Anthropic from "@anthropic-ai/sdk"

export class AnthropicMessagesMapper implements InferenceEndpointMapper {
	toRequest(inferenceParams: InferenceParams<ModelName>) {
		const { messages, system } = this.mapContextItems(inferenceParams)
		const outputConfig: any = {}

		const request: any = {
			model: inferenceParams.model,
			messages,
		}

		request.max_tokens = inferenceParams.maxOutputTokens ?? 8192

		if (system) {
			request.system = system
		}

		if (inferenceParams.tools && inferenceParams.tools.length > 0) {
			request.tools = inferenceParams.tools.map((tool) => ({
				name: tool.name,
				description: tool.description,
				input_schema: tool.parameters,
			}))
		}

		if (inferenceParams.structuredOutput) {
			outputConfig.format = {
				type: "json_schema",
				json_schema: inferenceParams.structuredOutput.schema,
			}
		}

		if (inferenceParams.reasoningEffort) {
			request.thinking = { type: "adaptive" }
			outputConfig.effort = inferenceParams.reasoningEffort
		}

		if (Object.keys(outputConfig).length > 0) {
			request.output_config = outputConfig
		}

		if (inferenceParams.streaming) {
			request.stream = inferenceParams.streaming
		}

		return request
	}

	toResponse(response: any): InferenceResponse {
		const contextItems = this.extractContextItems(response)
		const tokenUsage = this.extractTokenUsage(response)
		return new InferenceResponse(contextItems, tokenUsage)
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

	mapContextItems(inferenceParams: InferenceParams<ModelName>): { messages: any[]; system?: string } {
		const context = inferenceParams.context
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
