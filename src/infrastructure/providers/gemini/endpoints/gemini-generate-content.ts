import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { GoogleGenAI } from "@google/genai"
import type { Endpoint } from "@domain/generative-model/endpoint"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import { GeminiGenerateContentMapper } from "./gemini-generate-content-mapper"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

export interface GeminiConnectionConfig {
	baseURL?: string
	apiKey?: string
}

/**
 * Native Gemini adapter on the `@google/genai` SDK (`generateContent` /
 * `generateContentStream`). Unlike an OpenAI-compat shim this maps our
 * domain context to Gemini's native `contents`/`parts` shape, system
 * instruction, `functionDeclarations`, and `thinkingConfig`, and reads
 * thought parts + native usage metadata back out. Another `ModelRuntime`
 * — no runner or port changes.
 */
export class GeminiGenerateContent implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private readonly client: GoogleGenAI

	constructor(
		endpointMapper: InferenceEndpointMapper = new GeminiGenerateContentMapper(),
		config: GeminiConnectionConfig = {},
	) {
		this.endpointMapper = endpointMapper
		this.client = new GoogleGenAI({
			apiKey: config.apiKey ?? process.env.GEMINI_API_KEY,
			...(config.baseURL ? { httpOptions: { baseUrl: config.baseURL } } : {}),
		})
	}

	async infer(inferenceParams: InferenceParams): Promise<InferenceResponse> {
		const inferenceRequest = this.endpointMapper.toRequest(inferenceParams)
		const response = await this.client.models.generateContent(inferenceRequest)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceParams: InferenceParams): AsyncIterable<SemanticEvent> {
		const { signal } = inferenceParams
		const inferenceRequest = this.endpointMapper.toRequest(inferenceParams)
		const stream: any = await this.client.models.generateContentStream(inferenceRequest)

		for await (const chunk of stream) {
			if (signal?.aborted) {
				break
			}
			yield chunk
		}
	}
}
