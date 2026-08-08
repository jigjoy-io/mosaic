import type { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { GoogleGenAI } from "@google/genai"
import type { Endpoint } from "@domain/generative-model/endpoint"
import type { InferenceRequest } from "@domain/agentic-environment/inference/request"
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

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResponse> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const response = await this.client.models.generateContent(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceRequest: InferenceRequest): AsyncIterable<SemanticEvent> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const stream: any = await this.client.models.generateContentStream(request)

		for await (const chunk of stream) {
			yield chunk
		}
	}
}
