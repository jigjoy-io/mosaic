import { ModelSpecification } from "@domain/generative-model/model-specification"
import { CapabilitySpecification } from "../capability/specification";
import { InferenceParams } from "@domain/agentic-environment/inference/params";

export interface StreamingEndpointMapper {
    mapStreaming(inferenceParams: InferenceParams): unknown
}

export class StreamingSpecification implements CapabilitySpecification {
    
    constructor(private mapper: StreamingEndpointMapper) {}

    isSatisfiedBy(inferenceParams: InferenceParams, model: ModelSpecification): boolean {
        if(inferenceParams.streaming === undefined || inferenceParams.streaming === false) {
            return false
        }

        if(!model.supportsStreaming) {
            throw new Error(`Model ${model.name} does not support streaming`)
        }

        return true
    }

    mapToEndpointRequest(inferenceParams: InferenceParams): unknown {
        return this.mapper.mapStreaming(inferenceParams)
    }

}
