import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { StructuredOutputFormat } from "@domain/generative-model/capability/structured-output"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelContextRepository } from "@domain/model-context/model-context-repository"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import { Tool } from "@domain/generative-model/tool"
import { InMemoryModelContextRepository } from "@infra/repository/in-memory-model-context-repository"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { Participant } from "@domain/agentic-environment/participant"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { AgenticError } from "@domain/agentic-environment/errors/base-error"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { Endpoint } from "@domain/generative-model/endpoint"
import { RunInference } from "@app/use-cases/run-inference"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ExecuteFunctionCall } from "@app/use-cases/execute-function-call"
import { ModelName, ModelRepository } from "@app/services/model-repository"
import { FunctionCallRunner } from "@app/services/function-call-runner"
import { BaseParticipant } from "@app/participants/participant"
import { SendMessage } from "@app/use-cases/send-message"

const runInferenceUseCase = new RunInference(new ModelRepository())
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
	ModelName,
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
	StructuredOutputFormat,
	TokenUsage,
	InputTokenDetails,
	OutputTokenDetails,
	Tool,
	Endpoint,
	AgenticEnvironment,
	Participant,
	BaseParticipant,
	AgenticError,
	InferenceResponse,
	InferenceParams,
	runInference,
	executeFunctionCall,
	sendMessage
}