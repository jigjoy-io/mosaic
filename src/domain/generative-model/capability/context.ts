import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { CapabilitySpecification } from "./specification";
import { ModelName } from "@app/services/model-repository";
import { ModelSpecification } from "../model-specification";

export interface ContextEndpointMapper {
    mapContextItems(inferenceParams: InferenceParams<ModelName>): unknown
}

export class ContextSpecification implements CapabilitySpecification {
    constructor(private mapper: ContextEndpointMapper) {}

    isSatisfiedBy(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {

        let hasValidTypes = true
        inferenceParams.context.items.forEach(item => {
            if(!model.supportedContextItemTypes.includes(item.getType())) {
                hasValidTypes = false
                throw new Error(`Context item type ${item.getType()} is not supported for model ${model.name}`)
            }
        })
        
        return hasValidTypes
    }

    mapToEndpointRequest(inferenceParams: InferenceParams<ModelName>): unknown {
        return this.mapper.mapContextItems(inferenceParams)
    }
}