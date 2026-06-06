import { ModelName } from "@app/services/model-repository";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { EndpointRequestMapper } from "@domain/generative-model/endpoint-request-mapper";
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message";
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output";
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message";
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message";
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message";
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning";

export class OpenAIResponsesMapper implements EndpointRequestMapper {

    mapContextItems(inferenceParams: InferenceParams<ModelName>): unknown {

        const context = inferenceParams.context
        const messages: any[] = []
        for (const item of context.getItems()) {
            if (item instanceof DeveloperMessageItem) {
                messages.push({
                    type: item.type,
                    role: item.role,
                    content: item.content.text,
                })
            }
            if (item instanceof SystemMessageItem) {
                messages.push({
                    type: item.type,
                    role: item.role,
                    content: item.content.text,
                })
            }
            if (item instanceof UserMessageItem) {
                messages.push({
                    type: item.type,
                    role: item.role,
                    content: item.content.text,
                })
            }
            if (item instanceof ModelMessageItem) {
                messages.push({
                    type: item.type,
                    role: item.role,
                    content: item.content.text,
                })
            }
            if (item instanceof FunctionCallItem) {
                messages.push({
                    type: item.type,
                    name: item.name,
                    arguments: item.args,
                    call_id: item.callId
                })
            }

            if (item instanceof FunctionCallOutputItem) {
                messages.push({
                    type: item.type,
                    call_id: item.callId,
                    output: item.output.text,
                })
            }

            if (item instanceof ReasoningItem) {
                messages.push({
                    type: item.type,
                    content: item.content?.toJSON(),
                    encryptedContent: item.encryptedContent,
                    summary: item.summary.map((s) => s.toJSON()),
                })
            }
        }

        return messages
    }

    mapToolCalling(inferenceParams: InferenceParams<ModelName>): unknown {
        if (inferenceParams.tools && inferenceParams.tools.length > 0) {
			return {
                tools: inferenceParams.tools?.map((tool) => {
                    return {
                        type: tool.type,
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters,
                    }
                })
            }
		}
    }

    mapStructuredOutput(inferenceParams: InferenceParams<ModelName>): unknown {
        if (inferenceParams.structuredOutput) {
			const format = inferenceParams.structuredOutput
			return {
				text: {
                    format: {
                        type: "json_schema",
                        name: format.name ?? "response",
                        schema: format.schema,
                        strict: format.strict ?? true,
                    },
                }
            }
        }
    }

    mapReasoningEffort(inferenceParams: InferenceParams<ModelName>): unknown {
        if (inferenceParams.reasoningEffort) {
			return {
                reasoning : {
                    effort: inferenceParams.reasoningEffort,
                }
            }
		}
    }

    mapStreaming(inferenceParams: InferenceParams<ModelName>): unknown {
        return
    }
}