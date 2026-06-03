import { InferenceParams } from "../params";

export interface InferenceSpecification {
    isSatisfiedBy(inferenceParams: InferenceParams): boolean
}