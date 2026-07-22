import { Agent } from "@domain/agentic-environment/agent/agent"
import { AgentManifest } from "@domain/agentic-environment/participant-manifest"
import { Behavior } from "@domain/agentic-environment/behavior/behavior"
import { ActionBinding, WorkingMemory } from "@domain/agentic-environment/agent/memory"
import { DecisionSpecification } from "@domain/agentic-environment/behavior/decision-specification"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { infrenceRunner, runtime } from "src"
import { UserMessageEvent } from "./events/user-message-event"
import { RequestInferenceMapping } from "./events/run-inference-event"

const manifest = AgentManifest.create({
	id: "1",
	name: "Agent",
	instruction: "You are a helpful assistant.",
	tools: [],
})

class DefaultWorkingMemory extends WorkingMemory {
	constructor(private numberOfTry: number) {
		super()
	}

	getNumberOfTry(): number {
		return this.numberOfTry
	}

	addTry(): void {
		this.numberOfTry++
	}
}

class NumberOfTrySatisfied extends DecisionSpecification {
	constructor(private readonly numberOfTry: number) {
		super()
	}

	isSatisfiedBy(event: SemanticEvent, workingMemory: DefaultWorkingMemory): boolean {
		if (event.getType() !== "inference_requested") {
			return false
		}

		return workingMemory.getNumberOfTry() === this.numberOfTry
	}
}

const numberOfTrySatisfied = new NumberOfTrySatisfied(3)

const behaviors = [
	Behavior.create({
		when: numberOfTrySatisfied,
		then: [new ActionBinding<InferenceParams>(infrenceRunner, new RequestInferenceMapping())],
	}),
]

const workingMemory = new DefaultWorkingMemory(0)
const agent = Agent.create({ manifest, behaviors, workingMemory })

runtime.join(agent)
runtime.deliver(new UserMessageEvent(agent.getId(), new Date(), "What is the capital of France?"))
