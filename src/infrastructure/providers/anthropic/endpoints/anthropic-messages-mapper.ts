import { ModelName } from "@app/services/model-repository";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { ReasoningEffortEndpointMapper } from "@domain/generative-model/capability/reasoning-effort";
import { StreamingEndpointMapper } from "@domain/generative-model/capability/streaming";
import { StructuredOutputEndpointMapper } from "@domain/generative-model/capability/structured-output";
import { ToolCallingEndpointMapper } from "@domain/generative-model/capability/tool-calling";


export type EndpointRequestMapper = ToolCallingEndpointMapper &
                                    ReasoningEffortEndpointMapper &
                                    StreamingEndpointMapper &
                                    StructuredOutputEndpointMapper &
                                    ReasoningEffortEndpointMapper;

export class AnthropicMessagesMapper implements EndpointRequestMapper {

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