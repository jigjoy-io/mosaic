import { InferenceParams } from "../inference/params"

export interface RunInferenceUseCase {
    execute(inferenceParams: InferenceParams): Promise<void>
}