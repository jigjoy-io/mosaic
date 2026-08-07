import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { Situation, SituationContext } from "@domain/agentic-environment/participant/situation"
import { SituationSpecification } from "@domain/agentic-environment/participant/situation-specification"
import { resolveRuntime } from "example/runtime"
import { inference, Interception, participantMessageSent } from "src"

export class MessageReceivedInterception implements Interception<InferenceParams> {
	id: string = "message-received"
	name: string = "Message Received"

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

export const messageReceivedSituation: Situation<InferenceParams> = {
	specification: participantMessageSent,
	intercepttion: new MessageReceivedInterception(),
	action: inference,
}

export class FreemiumAvailable extends SituationSpecification {
	readonly conditionId = "freemium.available"
	private readonly runtime = resolveRuntime()
	isSatisfiedBy(): boolean {
		const { freemiumAccount } = this.runtime.state

		freemiumAccount.addTry()
		return freemiumAccount.getNumberOfTry() <= freemiumAccount.getMaxNumberOfTry()
	}
}

const freemiumSituation: Situation<InferenceParams> = {
	...messageReceivedSituation,
	specification: participantMessageSent.and(new FreemiumAvailable()),
}
