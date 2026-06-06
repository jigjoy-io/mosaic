import { CapabilitySpecification } from "./specification"
import { ModelSpecification } from "../model-specification"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName } from "@app/services/model-repository"

export interface ToolCallingEndpointMapper {
    mapToolCalling(inferenceParams: InferenceParams<ModelName>): unknown
}

export class ToolCallingSpecification implements CapabilitySpecification {

    constructor(private mapper: ToolCallingEndpointMapper) {}

    isSatisfiedBy(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
        if(inferenceParams.tools === undefined || inferenceParams.tools.length === 0) {
            return false
        }

        if(!model.supportsFunctionCalling) {
            throw new Error(`Model ${model.name} does not support function calling`)
        }

        return true
    }

    mapToEndpointRequest(inferenceParams: InferenceParams<ModelName>): unknown {
        return this.mapper.mapToolCalling(inferenceParams)
    }
}