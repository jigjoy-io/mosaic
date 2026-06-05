import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { StructuredOutputCapability, StructuredOutputFormat } from "@domain/generative-model/capability/structured-output"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelContextRepository } from "@domain/model-context/model-context-repository"
import { Gpt54Nano } from "@infra/providers/openai/models/gpt-5-4-nano"
import { Gpt54 } from "@infra/providers/openai/models/gpt-5-4"
import { Gpt54Mini } from "@infra/providers/openai/models/gpt-5-4-mini"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import { Tool } from "@domain/generative-model/tool"
import { InMemoryModelContextRepository } from "@infra/repository/in-memory-model-context-repository"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { Participant } from "@domain/agentic-environment/participant"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { AgenticError } from "@domain/agentic-environment/errors/base-error"
import { Gpt55 } from "@infra/providers/openai/models/gpt-5-5"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { OpenAIResponses } from "@infra/providers/openai/runtime/openai-responses"
import { AnthropicMessages } from "@infra/providers/anthropic/runtime/anthropic-messages"
import { ClaudeOpus48 } from "@infra/providers/anthropic/models/claude-4-8-opus"
import { ClaudeOpus47 } from "@infra/providers/anthropic/models/claude-4-7-opus"
import { ClaudeSonnet46 } from "@infra/providers/anthropic/models/claude-4-6-sonnet"
import { ClaudeHaiku45 } from "@infra/providers/anthropic/models/claude-4-5-haiku"
import { DeepSeekV4Flash } from "@infra/providers/deepseek/models/deepseek-v4-flash"
import { DeepSeekV4Pro } from "@infra/providers/deepseek/models/deepseek-v4-pro"
import { GeminiGenerateContent } from "@infra/providers/gemini/runtime/gemini-generate-content"
import { Gemini35Flash } from "@infra/providers/gemini/models/gemini-3-5-flash"
import { Gemini31Pro } from "@infra/providers/gemini/models/gemini-3-1-pro"
import { OpenAIChatCompletions } from "@infra/providers/openai/runtime/openai-chat-completions"
import { InferenceRunner } from "@app/services/inference-runner"
import { Endpoint } from "@domain/generative-model/runtime"
import { RunInference } from "@app/use-cases/run-inference"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ExecuteFunctionCall } from "@app/use-cases/execute-function-call"
import { ModelName, ModelRepository } from "@app/services/model-repository"
import { FunctionCallRunner } from "@app/services/function-call-runner"
import { BaseParticipant } from "@app/participants/participant"
import { SendMessage } from "@app/use-cases/send-message"

const runInferenceUseCase = new RunInference(new ModelRepository(), new InferenceRunner())
const executeFunctionCallUseCase = new ExecuteFunctionCall(new FunctionCallRunner())
const sendMessageUseCase = new SendMessage()

const runInference = (inferenceParams: InferenceParams<ModelName>): void => {
	runInferenceUseCase.execute(inferenceParams)
}

const executeFunctionCall = (environment: AgenticEnvironment, functionCallItem: FunctionCallItem, tool: Tool, caller: Participant): void => {
	executeFunctionCallUseCase.execute(environment, functionCallItem, tool, caller)
}

const sendMessage = (environment: AgenticEnvironment, message: string, caller: Participant): void => {
	sendMessageUseCase.execute(environment, message, caller)
}

export {
	ModelContext,
	ModelContextRepository,
	InMemoryModelContextRepository,
	ContextItem,
	SemanticEvent,
	UserMessageItem,
	DeveloperMessageItem,
	SystemMessageItem,
	ModelMessageItem,
	FunctionCallItem,
	FunctionCallOutputItem,
	ReasoningItem,
	GenerativeModel,
	StructuredOutputCapability,
	StructuredOutputFormat,
	Gpt54,
	Gpt54Mini,
	Gpt54Nano,
	Gpt55,
	TokenUsage,
	InputTokenDetails,
	OutputTokenDetails,
	Tool,
	Endpoint,
	AgenticEnvironment,
	Participant,
	BaseParticipant,
	AgenticError,
	InferenceRequest,
	InferenceResponse,
	OpenAIResponses,
	OpenAIChatCompletions,
	AnthropicMessages,
	ClaudeOpus48,
	ClaudeOpus47,
	ClaudeSonnet46,
	ClaudeHaiku45,
	DeepSeekV4Flash,
	DeepSeekV4Pro,
	GeminiGenerateContent,
	Gemini35Flash,
	Gemini31Pro,
	runInference,
	executeFunctionCall,
	sendMessage,
	ModelName
}