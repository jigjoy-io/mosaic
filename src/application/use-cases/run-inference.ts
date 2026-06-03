import { AnthropicMessages } from "@infra/providers/anthropic/runtime/anthropic-messages";
import { OpenAIResponses, OpenAIResponsesEndpoint } from "@infra/providers/openai/runtime/openai-responses";
import { GeminiGenerateContent } from "@infra/providers/gemini/runtime/gemini-generate-content";
import { OpenAIChatCompletions } from "@infra/providers/openai/runtime/openai-chat-completions";
import { GenerativeModel } from "@domain/generative-model/generative-model";
import { ClaudeHaiku45 } from "@infra/providers/anthropic/models/claude-4-5-haiku";
import { ClaudeSonnet46 } from "@infra/providers/anthropic/models/claude-4-6-sonnet";
import { ClaudeOpus48 } from "@infra/providers/anthropic/models/claude-4-8-opus";
import { ClaudeOpus47 } from "@infra/providers/anthropic/models/claude-4-7-opus";
import { Gemini35Flash } from "@infra/providers/gemini/models/gemini-3-5-flash";
import { Gemini31Pro } from "@infra/providers/gemini/models/gemini-3-1-pro";
import { DeepSeekV4Flash } from "@infra/providers/deepseek/models/deepseek-v4-flash";
import { DeepSeekV4Pro } from "@infra/providers/deepseek/models/deepseek-v4-pro";
import { Gpt54 } from "@infra/providers/openai/models/gpt-5-4";
import { Gpt54Mini } from "@infra/providers/openai/models/gpt-5-4-mini";
import { Gpt54Nano } from "@infra/providers/openai/models/gpt-5-4-nano";
import { Gpt55 } from "@infra/providers/openai/models/gpt-5-5";
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning";
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message";
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { RunInferenceUseCase } from "@domain/agentic-environment/use-cases/run-inference";
import { InferenceRunner } from "@app/services/inference-runner";
import { Endpoint } from "@domain/generative-model/runtime";


export type ModelInfo = {
    endpoint: Endpoint;
    model: GenerativeModel;
}

export class ModelRepository {
    
    getModelInfo(model: string): ModelInfo {
        switch (model) {
            case "gpt-5-4":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new Gpt54() };
            case "gpt-5-4-mini":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new Gpt54Mini() };
            case "gpt-5-4-nano":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new Gpt54Nano() };
            case "gpt-5-5":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new Gpt55() };
            case "claude-4-5-haiku":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new ClaudeHaiku45() };
            case "claude-4-6-sonnet":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new ClaudeSonnet46() };
            case "claude-4-7-opus":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new ClaudeOpus47() };
            case "claude-4-8-opus":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new ClaudeOpus48() };
            case "gemini-3-5-flash":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new Gemini35Flash() };
            case "gemini-3-1-pro":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new Gemini31Pro() };
            case "deepseek-v4-flash":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new DeepSeekV4Flash() };
            case "deepseek-v4-pro":
                return { endpoint: new OpenAIResponsesEndpoint(new OpenAIResponses(), new OpenAIResponses()), model: new DeepSeekV4Pro() };
            default:
                throw new Error(`Unsupported model: ${model}`);
        }
    }

}

export class RunInference implements RunInferenceUseCase {

    constructor(private readonly modelRepository: ModelRepository, private readonly inferenceRunner: InferenceRunner) {}

    async execute(inferenceParams: InferenceParams): Promise<void> {
        const { model, reasoningEffort, tools, streaming, context, caller, environment, signal } = inferenceParams;

        const modelInfo = this.modelRepository.getModelInfo(model);

        const result = this.inferenceRunner.run(context, modelInfo, signal)
    
        for await (const item of result) {

            if(signal?.aborted) {
                break
            }

            if (item instanceof ReasoningItem) {
                environment.deliverReasoning(caller, item)
            } else if (item instanceof FunctionCallItem) {
                environment.deliverFunctionCall(caller, item)
            } else if (item instanceof ModelMessageItem) {
                environment.deliverModelMessage(caller, item)
            } else if (item instanceof SemanticEvent) {
                environment.deliverSemanticEvent(caller, item)
            }
        }
    }
}