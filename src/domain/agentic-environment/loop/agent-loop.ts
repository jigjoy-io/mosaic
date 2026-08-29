import { LoopTransition, ReceivedMessage } from "./loop-state"
import { LoopVisitor } from "./loop-visitor"
import { LoopStateExecutor } from "./state-executor"
import { TransitionResolver } from "./transition-resolver"

export class AgentLoop {
	constructor(
		private readonly stateExecutor: LoopStateExecutor,
		private readonly transitionResolver: TransitionResolver,
		private readonly loopVisitor: LoopVisitor,
	) {}

	async run(message: ReceivedMessage): Promise<void> {
		let transition: LoopTransition = {
			nextStateId: "message_received",
			input: message,
		}

		while (transition.nextStateId !== "idle") {
			const execution = await this.stateExecutor.execute(transition, this.loopVisitor)

			transition = this.transitionResolver.resolve(execution)
		}
	}
}
