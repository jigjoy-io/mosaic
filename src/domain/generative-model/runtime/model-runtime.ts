import { InferenceRequest } from "@domain/generative-model/inference-request"
import { InferenceResponse } from "@domain/generative-model/inference-response"

/**
 * Provider-agnostic port for a single round of inference.
 *
 * Lives in the domain layer; concrete adapters (OpenAI Responses,
 * Anthropic Messages, DeepSeek Chat Completions, …) live in the
 * infrastructure layer and are injected into application-layer runners
 * through their constructor. The application layer must depend on this
 * interface, never on a concrete provider client.
 */
export interface ModelRuntime {
	infer(request: InferenceRequest): Promise<InferenceResponse>
}
