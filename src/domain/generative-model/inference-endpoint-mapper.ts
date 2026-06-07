import { ModelName } from "./generative-model"
import { InferenceParams } from "@domain/agentic-environment/inference/params"

export interface ProviderEndpointMapper {
	toRequest(inferenceParams: InferenceParams<ModelName>): any
}
