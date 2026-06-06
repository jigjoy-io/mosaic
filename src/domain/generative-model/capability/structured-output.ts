import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelSpecification } from "../model-specification"
import { CapabilitySpecification } from "./specification"
import { ModelName } from "@app/services/model-repository"

export type StructuredOutputFormat = {
	name?: string
	schema: Record<string, any>
	strict?: boolean
}

export interface StructuredOutputEndpointMapper {
    mapStructuredOutput(inferenceParams: InferenceParams<ModelName>): unknown
}

export class StructuredOutputSpecification implements CapabilitySpecification {
    constructor(private mapper: StructuredOutputEndpointMapper) {}

    isSatisfiedBy(inferenceParams: InferenceParams<ModelName>, model: ModelSpecification): boolean {
        if(inferenceParams.structuredOutput === undefined) {
            return false
        }

        if(!model.supportsStructuredOutput) {
            throw new Error(`Model ${model.name} does not support structured output`)
        }

        return true
    }

	mapToEndpointRequest(inferenceParams: InferenceParams<ModelName>): any {
		return this.mapper.mapStructuredOutput(inferenceParams)
	}
}