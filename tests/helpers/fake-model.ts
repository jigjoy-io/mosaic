import { GenerativeModel, ModelSpecification } from "@domain/generative-model/generative-model"
import { Tool } from "@domain/generative-model/tool"

/** Minimal in-memory GenerativeModel for wiring tests — no provider behind it. */
export function makeModel(streaming = false): GenerativeModel {
	const specification: ModelSpecification = {
		name: "test-model",
		supportReasoningEffort: true,
		defaultReasoningEffort: "medium",
		supportStreaming: true,
		contextWindowSize: 1000,
		maxOutputTokens: 100,
		supportFunctionCalling: true,
	}
	let effort = "medium"
	let streamingEnabled = streaming
	let tools: Tool[] = []
	return {
		specification,
		setReasoningEffort: (e: string) => {
			effort = e
		},
		getReasoningEffort: () => effort,
		setStreaming: (s: boolean) => {
			streamingEnabled = s
		},
		getStreaming: () => streamingEnabled,
		setTools: (t: Tool[]) => {
			tools = t
		},
		getTools: () => tools,
	}
}
