import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { Situation, SituationContext } from "@domain/agentic-environment/participant/situation"
import { SituationSpecification } from "@domain/agentic-environment/participant/situation-specification"
import { resolveRuntime } from "example/runtime"
import { inference, Interception } from "src"

export class MessageReceived extends SituationSpecification {
	readonly conditionId = "message.received"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "message.received"
	}
}

export class FreemiumAvailable extends SituationSpecification {
	readonly conditionId = "freemium.available"
	private readonly runtime = resolveRuntime()
	isSatisfiedBy(): boolean {
		const { freemiumAccount } = this.runtime.state

		return freemiumAccount.getNumberOfTry() < freemiumAccount.getMaxNumberOfTry()
	}
}

export class MessageReceivedInterception implements Interception<InferenceParams> {
	apply(context: SituationContext): InferenceParams {
		const { participant } = context
		return {
			model: "gpt-5.4",
			streaming: false,
			callerId: "user-123",
			context: participant.memory.getContext(),
		}
	}
}

export const messageReceived: Situation<InferenceParams> = {
	specification: new MessageReceived().and(new FreemiumAvailable()),
	intercepttion: new MessageReceivedInterception(),
	action: inference,
}
