import { ModelContext } from "@domain/model-context/model-context"
import { ContextItem } from "@domain/model-context/context-item/context-item"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelContextRepository } from "@domain/model-context/model-context-repository"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import { Tool } from "@domain/generative-model/tool"
import { McpClient, type McpServerConfig, type McpToolSpec } from "@infra/mcp/mcp-client"
import { McpToolRegistry } from "@infra/mcp/mcp-tool-registry"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { Endpoint } from "@domain/generative-model/endpoint"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName } from "@domain/generative-model/generative-model"
import { RuntimeService } from "./application/services/runtime"
import { defineRuntime } from "@app/use-cases/runtime"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { createAgent } from "@app/use-cases/create-agent"
import { createParticipant } from "@app/use-cases/create-participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { Condition } from "@domain/agentic-environment/participant/process/condition"
import { createRule } from "@app/use-cases/create-rule"
import { Action } from "@domain/agentic-environment/participant/process/process"
import { Inference } from "@app/services/inference"
import { FunctionCall } from "@app/services/function-call"
import { InMemoryGenerativeModelRepository } from "@infra/repository/generative-model-repository"
import { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"

const functionCall = new FunctionCall()
const generativeModelRepository = new InMemoryGenerativeModelRepository()
const requestValidator = new InferenceRequestValidator()
const inference = new Inference(generativeModelRepository, requestValidator)

export {
	defineRuntime,
	RuntimeState,
	createRule,
	createAgent,
	createParticipant,
	RuntimeService,
	ModelContext,
	ModelContextRepository,
	ModelName,
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
	McpClient,
	type McpServerConfig,
	type McpToolSpec,
	McpToolRegistry,
	Endpoint,
	Participant,
	Condition,
	Action,
	inference,
	functionCall,
	InferenceResponse,
	InferenceParams,
}
