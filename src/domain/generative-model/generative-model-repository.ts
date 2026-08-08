import type { GenerativeModel } from "./generative-model"

export interface GenerativeModelRepository {
	getByModelName(modelName: string): Promise<GenerativeModel>
}
