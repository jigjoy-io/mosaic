import { AgentLoopManager, LoopStateId } from "./agent-loop-manager"

export interface AgentLoopState {
	id: LoopStateId
	run(agentLoopManager: AgentLoopManager): void | Promise<void>
}

export class InferenceLoopState implements AgentLoopState {
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
