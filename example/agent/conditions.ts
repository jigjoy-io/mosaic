import { resolveRuntime } from "example/runtime"
import { Condition, Participant, SemanticEvent } from "src"

export class UserSentMessage extends Condition {
	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		return event.type === "user.sent.message"
	}
}

export class FreemiumAvailable extends Condition {
	private readonly runtime = resolveRuntime()
	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		const { freemiumAccount } = this.runtime.state

		return freemiumAccount.getNumberOfTry() < freemiumAccount.getMaxNumberOfTry()
	}
}

export class FunctionCallRequested extends Condition {
	isSatisfiedBy(event: SemanticEvent, consumer: Participant): boolean {
		return event.type === "functions.call.requested"
	}
}
