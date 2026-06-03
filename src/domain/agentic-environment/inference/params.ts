import { Tool } from "@domain/generative-model/tool";
import { ModelContext } from "@domain/model-context/model-context";
import { Agent } from "@domain/agentic-environment/participants/agent";
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment";

export type InferenceParams = {
    model: string;
    reasoningEffort?: string;
    tools?: Tool[];
    streaming?: boolean;
    context: ModelContext;
    caller: Agent;
    environment: AgenticEnvironment;
    signal?: AbortSignal;
}