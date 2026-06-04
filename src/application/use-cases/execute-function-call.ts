import { FunctionCallRunner } from "@app/services/function-call-runner";
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment";
import { Participant } from "@domain/agentic-environment/participant";
import { ExecuteFunctionCallUseCase } from "@domain/agentic-environment/use-cases/execute-function-call";
import { Tool } from "@domain/generative-model/tool";
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";

export class ExecuteFunctionCall implements ExecuteFunctionCallUseCase {

    constructor(private readonly functionCallRunner: FunctionCallRunner) {}

    async execute(environment: AgenticEnvironment, functionCallItem: FunctionCallItem, tool: Tool, caller: Participant, signal?: AbortSignal): Promise<void> {
        const stream = this.functionCallRunner.run(functionCallItem, tool, signal)

        for await (const item of stream) {
            environment.deliverFunctionCallOutput(caller, item)
        }
    }
}