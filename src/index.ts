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
import { InMemoryModelContextRepository } from "@infra/repository/in-memory-model-context-repository"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { Participant } from "@domain/agentic-environment/participant"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { Endpoint } from "@domain/generative-model/endpoint"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName } from "@domain/generative-model/generative-model"
import { Action } from "@domain/agentic-environment/behavior/action"
import { RuntimeService } from "./application/services/runtime"
import { Channel } from "@domain/agentic-environment/channel"
import { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { RunInference } from "@app/actions/run-inference"
import { InMemoryGenerativeModelRepository } from "@infra/repository/generative-model-repository"

const channel = new Channel()
const runtime = new RuntimeService(channel)

const generativeModelRepository = new InMemoryGenerativeModelRepository()
const inferenceRequestValidator = new InferenceRequestValidator()

const infrenceRunner = new RunInference(generativeModelRepository, inferenceRequestValidator)

export {
	infrenceRunner,
	runtime,
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
	McpClient,
	type McpServerConfig,
	type McpToolSpec,
	McpToolRegistry,
	Endpoint,
	Participant,
	Action,
	InferenceResponse,
	InferenceParams,
}
