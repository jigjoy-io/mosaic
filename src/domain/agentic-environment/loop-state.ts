import { AgentLoop, LoopStateId } from "./agent-loop"

export interface AgentLoopState {
	id: LoopStateId
	run(agentLoop: AgentLoop): void | Promise<void>
}

export class Inference implements AgentLoopState {
	public readonly id = "inference"
	run(): void | Promise<void> {
		throw new Error("Method not implemented.")
	}
}

export class FunctionCall implements AgentLoopState {
	public readonly id = "function_call"
	run(): void | Promise<void> {
		throw new Error("Method not implemented.")
	}
}

export class ModelMessage implements AgentLoopState {
	public readonly id = "model_message"

	run(): void | Promise<void> {
		throw new Error("Method not implemented.")
	}
}
