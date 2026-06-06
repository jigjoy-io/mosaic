
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning";
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message";
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { RunInferenceUseCase } from "@domain/agentic-environment/use-cases/run-inference";
import { ModelRepository } from "@app/services/model-repository";
import { StructuredOutputSpecification } from "@domain/generative-model/capability/structured-output";
import { ToolCallingSpecification } from "@domain/generative-model/capability/tool-calling";
import { ReasoningEffortSpecification } from "@domain/generative-model/capability/reasoning-effort";
import { StreamingSpecification } from "@domain/generative-model/capability/streaming";
import { NonStreamingInference, StreamingInference } from "@app/services/inference-runner";
import { ModelName } from "@app/services/model-repository";
import { ContextSpecification } from "@domain/generative-model/capability/context";

export class RunInference implements RunInferenceUseCase<ModelName> {

    constructor(private readonly modelRepository: ModelRepository) {}

    async execute(inferenceParams: InferenceParams<ModelName>): Promise<void> {

        const { caller, environment } = inferenceParams

        const modelInfo = this.modelRepository.getModelInfo(inferenceParams.model)
        
        const capabilites = [
            new ReasoningEffortSpecification(modelInfo.mapper),
            new ToolCallingSpecification(modelInfo.mapper),
            new StreamingSpecification(modelInfo.mapper),
            new StructuredOutputSpecification(modelInfo.mapper),
            new ContextSpecification(modelInfo.mapper),
        ]

        let request = {}
        for (const capability of capabilites) {
            if (capability.isSatisfiedBy(inferenceParams, modelInfo.specification)) {
                request = { ...request, ...capability.mapToEndpointRequest(inferenceParams) }
            }
        }

        let result: AsyncIterable<any> | undefined
        if (inferenceParams.streaming) {
            const inferenceRunner = new StreamingInference()
            result = inferenceRunner.run(request, modelInfo.endpoint)
        } else {
            const inferenceRunner = new NonStreamingInference()
            result = inferenceRunner.run(request, modelInfo.endpoint)
        }
    
        for await (const item of result) {
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
