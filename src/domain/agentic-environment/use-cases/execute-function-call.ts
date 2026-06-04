import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";
import { AgenticEnvironment } from "../agentic-environment";
import { Participant } from "../participant";
import { Tool } from "@domain/generative-model/tool";

export interface ExecuteFunctionCallUseCase{

    execute(
        environment: AgenticEnvironment,
        functionCallItem: FunctionCallItem,
        tool: Tool,
        caller: Participant,
        signal?: AbortSignal,
    ): Promise<void>
}