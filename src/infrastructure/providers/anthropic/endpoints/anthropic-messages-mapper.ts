import { ModelName } from "@app/services/model-repository";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { ContextEndpointMapper } from "@domain/generative-model/capability/context";
import { ReasoningEffortEndpointMapper } from "@domain/generative-model/capability/reasoning-effort";
import { StreamingEndpointMapper } from "@domain/generative-model/capability/streaming";
import { StructuredOutputEndpointMapper } from "@domain/generative-model/capability/structured-output";
import { ToolCallingEndpointMapper } from "@domain/generative-model/capability/tool-calling";
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message";
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output";
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message";
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message";
import { ContextItem } from "@domain/model-context/context-item/context-item";
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message";


export type EndpointRequestMapper = ToolCallingEndpointMapper &
                                    ReasoningEffortEndpointMapper &
                                    StreamingEndpointMapper &
                                    StructuredOutputEndpointMapper &
                                    ReasoningEffortEndpointMapper &
                                    ContextEndpointMapper;

export class AnthropicMessagesMapper implements EndpointRequestMapper {

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

    mapToolCalling(inferenceParams: InferenceParams<ModelName>): unknown {
        return {
            tools: inferenceParams.tools?.map((tool) => {
				return {
					name: tool.name,
					description: tool.description,
					input_schema: tool.parameters,
				}
			}),
        }
    }

    mapStructuredOutput(inferenceParams: InferenceParams<ModelName>): unknown {
        return {
            output_config: {
				format: {
					type: "json_schema",
					json_schema: inferenceParams.structuredOutput?.schema,
				},
			}
        }
    }

    mapReasoningEffort(inferenceParams: InferenceParams<ModelName>): unknown {

        return {
            output_config: {
                effort: inferenceParams.reasoningEffort,
            }
        }
    }

    mapStreaming(inferenceParams: InferenceParams<ModelName>): unknown {
        return {
            streaming: inferenceParams.streaming,
        }
    }
}