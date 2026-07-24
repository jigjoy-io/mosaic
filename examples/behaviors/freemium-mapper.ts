import { SituationMapper } from "@domain/agentic-environment/agent/memory"
import { InferenceParams, UserMessageItem } from "src"
import { FreemiumSituation } from "./freemium-situation"

export class FreemiumSituationMapper implements SituationMapper<InferenceParams> {
	map(situation: FreemiumSituation): InferenceParams {
		const { event, participant } = situation

		const message = `${event.getProducerId()}: ${event.getMessage()}`
		let context = participant.memory.getContext()
		context.addItem(UserMessageItem.create(message))

		const inferenceParams: InferenceParams = {
			context,
			model: "gpt-5.5",
			caller: event.getProducerId(),
		}

		return inferenceParams
	}
}
