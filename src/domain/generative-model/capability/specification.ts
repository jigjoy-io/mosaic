import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelSpecification } from "@domain/generative-model/model-specification"
import { ModelName } from "@app/services/model-repository"

export interface CapabilitySpecification {
    isSatisfiedBy(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean
    mapToEndpointRequest(inferenceParams: InferenceParams<ModelName>): unknown
}