import { InferenceRunner } from "@app/services/inference-runner"
import { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { InMemoryGenerativeModelRepository } from "@infra/repository/generative-model-repository"

const generativeModelRepository = new InMemoryGenerativeModelRepository()
const inferenceRequestValidator = new InferenceRequestValidator()

const inferenceRunner = new InferenceRunner(generativeModelRepository, inferenceRequestValidator)

export function resolveInferenceRunner(): InferenceRunner {
	return inferenceRunner
}
