import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning";
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message";
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { RunInferenceUseCase } from "@domain/agentic-environment/use-cases/run-inference";
import { InferenceRunner } from "@app/services/inference-runner";
import { ModelRepository } from "@app/services/model-repository";
import { GenerativeModel } from "@domain/generative-model/generative-model";


export class RunInference implements RunInferenceUseCase {

    constructor(private readonly modelRepository: ModelRepository, private readonly inferenceRunner: InferenceRunner) {}

    private setModelCapabilities(model: GenerativeModel, inferenceParams: InferenceParams) {
        const { streaming, tools, reasoningEffort, structuredOutput } = inferenceParams;

        if (streaming) {
            model.setStreaming(true)
        }

        if (tools) {
            model.setTools(tools)
        }

        if (reasoningEffort) {
            model.setReasoningEffort(reasoningEffort)
        }

        if (structuredOutput) {
            model.setStructuredOutput(structuredOutput)
        }
        
        return model;
    }

    async execute(inferenceParams: InferenceParams): Promise<void> {
        const { model, context, caller, environment, signal } = inferenceParams;

        
        const modelInfo = this.modelRepository.getModelInfo(model);

        const generativeModel = this.setModelCapabilities(modelInfo.model, inferenceParams);
        modelInfo.model = generativeModel;

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