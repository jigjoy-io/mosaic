import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { CapabilitySpecification } from "./specification"
import { ModelSpecification } from "../model-specification"
import { ModelName } from "@app/services/model-repository"

export interface ReasoningEffortEndpointMapper {
    mapReasoningEffort(inferenceParams: InferenceParams<ModelName>): unknown
}

export class ReasoningEffortSpecification implements CapabilitySpecification {

    constructor(private mapper: ReasoningEffortEndpointMapper) {}

    isSatisfiedBy(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {

        if(inferenceParams.reasoningEffort === undefined) {
            return false
        }

        if(!model.supportsReasoningEffort) {
            throw new Error(`Model ${model.name} does not support reasoning effort`)
        }

        const supportedEfforts = model.supportedReasoningEfforts

        if(!supportedEfforts.includes(inferenceParams.reasoningEffort)) {
            throw new Error(`Reasoning effort ${inferenceParams.reasoningEffort} is not supported for model ${model.name}`)
        }

        return true
    }

    mapToEndpointRequest(inferenceParams: InferenceParams<ModelName>): unknown {
        return this.mapper.mapReasoningEffort(inferenceParams)
    }

}
