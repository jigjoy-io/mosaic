import { GenerativeModel, ModelName } from "./generative-model"

export interface GenerativeModelRepository {
	getByModelName(modelName: ModelName): Promise<GenerativeModel>
}
