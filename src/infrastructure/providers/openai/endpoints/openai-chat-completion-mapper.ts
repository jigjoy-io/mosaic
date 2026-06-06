import { ModelName } from "@app/services/model-repository";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { EndpointRequestMapper } from "@domain/generative-model/endpoint-request-mapper";
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message";
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output";
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message";
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message";
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message";

export class OpenAIResponsesMapper implements EndpointRequestMapper {
    mapContextItems(inferenceParams: InferenceParams<ModelName>): unknown {
        const messages: any[] = []
        const context = inferenceParams.context

		for (const item of context.getItems()) {
			if (item instanceof DeveloperMessageItem || item instanceof SystemMessageItem) {
				messages.push({ role: "system", content: item.content.text })
				continue
			}

			if (item instanceof UserMessageItem) {
				messages.push({ role: "user", content: item.content.text })
				continue
			}

			if (item instanceof ModelMessageItem) {
				messages.push({ role: "assistant", content: item.content.text })
				continue
			}

			if (item instanceof FunctionCallItem) {
				const toolCall = {
					id: item.callId,
					type: "function",
					function: { name: item.name, arguments: item.args },
				}
				const last = messages[messages.length - 1]
				if (last?.role === "assistant") {
					last.tool_calls = last.tool_calls ?? []
					last.tool_calls.push(toolCall)
				} else {
					messages.push({ role: "assistant", content: null, tool_calls: [toolCall] })
				}
				continue
			}

			if (item instanceof FunctionCallOutputItem) {
				messages.push({ role: "tool", tool_call_id: item.callId, content: item.output.text })
			}
		}

		return messages
    }
    
    mapToolCalling(inferenceParams: InferenceParams<ModelName>): unknown {
        if (inferenceParams.tools && inferenceParams.tools.length > 0) {
			return {tools :inferenceParams.tools.map((tool) => {
				return {
					type: "function",
					function: {
						name: tool.name,
						description: tool.description,
						parameters: tool.parameters,
					},
				}
			})
		}}
    }

    mapStructuredOutput(inferenceParams: InferenceParams<ModelName>): unknown {
        throw new Error("Method not implemented.");
    }

    mapReasoningEffort(inferenceParams: InferenceParams<ModelName>): unknown {
        if (inferenceParams.reasoningEffort) {
			return {
                reasoning_effort : inferenceParams.reasoningEffort
            }
		}
    }

    mapStreaming(inferenceParams: InferenceParams<ModelName>): unknown {
        return
    }

}