import { ModelSpecification } from "@domain/generative-model/model-specification"
import { CapabilitySpecification } from "../capability/specification";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { ModelName } from "@app/services/model-repository";

export interface StreamingEndpointMapper {
    mapStreaming(inferenceParams: InferenceParams<ModelName>): unknown
}

export class StreamingSpecification implements CapabilitySpecification {
    
    constructor(private mapper: StreamingEndpointMapper) {}

    isSatisfiedBy(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
        if(inferenceParams.streaming === undefined || inferenceParams.streaming === false) {
            return false
        }

        if(!model.supportsStreaming) {
            throw new Error(`Model ${model.name} does not support streaming`)
        }

        return true
    }

    mapToEndpointRequest(inferenceParams: InferenceParams<ModelName>): unknown {
        return this.mapper.mapStreaming(inferenceParams)
    }

}
