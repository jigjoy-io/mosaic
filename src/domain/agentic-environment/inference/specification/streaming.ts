import { InferenceParams } from "../params";
import { InferenceSpecification } from "./specification";

export class StreamingParamSpecification implements InferenceSpecification {
    isSatisfiedBy(inferenceParams: InferenceParams): boolean {
        return inferenceParams.streaming === true
    }
}