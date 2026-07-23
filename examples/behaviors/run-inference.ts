import { EventProcessing } from "@domain/agentic-environment/agent/memory"
import { Behavior } from "@domain/agentic-environment/behavior/behavior"
import { FreemiumSatisfied } from "examples/decisions/number-of-try-satisfied"
import { RequestInferenceEventMapper } from "examples/events/run-inference-event"
import { InferenceParams, infrenceRunner } from "src"

const freemiumSatisfied = new FreemiumSatisfied(3)
const requestInferenceEventMapper = new RequestInferenceEventMapper()
const inferenceRunProcess = new EventProcessing<InferenceParams>(requestInferenceEventMapper, infrenceRunner)

const runInferenceBehavior = Behavior.create({
	when: freemiumSatisfied,
	then: [inferenceRunProcess],
})

export { runInferenceBehavior }
