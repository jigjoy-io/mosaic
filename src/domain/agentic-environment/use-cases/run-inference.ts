import { InferenceParams } from "../inference/params"

export interface RunInferenceUseCase<TModel extends string> {
    execute(inferenceParams: InferenceParams<TModel>): Promise<void>
}