import { Agent } from "@domain/agentic-environment/agent/agent"
import { AgentManifest } from "@domain/agentic-environment/participant-manifest"
import { Behavior } from "@domain/agentic-environment/behavior/behavior"
import { ActionBinding, ContextProjection, WorkingMemory } from "@domain/agentic-environment/agent/memory"
import { Channel } from "@domain/agentic-environment/channel"
import { DecisionSpecification } from "@domain/agentic-environment/behavior/decision-specification"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { RunInference } from "@app/actions/run-inference"
import { InMemoryGenerativeModelRepository } from "@infra/repository/generative-model-repository"
import { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"

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

const generativeModelRepository = new InMemoryGenerativeModelRepository()
const inferenceRequestValidator = new InferenceRequestValidator()

const action = new RunInference(generativeModelRepository, inferenceRequestValidator)
const numberOfTrySatisfied = new NumberOfTrySatisfied(3)

class RequestInfereceEvent extends SemanticEvent {
	type = "inference_requested"
	constructor(
		producerId: string,
		occurredAt: Date,
		private readonly inferenceParams: InferenceParams,
	) {
		super(producerId, occurredAt)
	}

	getInferenceParams(): InferenceParams {
		return this.inferenceParams
	}
}

class RequestInferenceMapping implements ContextProjection<InferenceParams> {
	project(event: RequestInfereceEvent, memory: WorkingMemory): InferenceParams {
		return event.getInferenceParams()
	}
}

const behaviors = [
	Behavior.create({
		when: numberOfTrySatisfied,
		then: [new ActionBinding<InferenceParams>(action, new RequestInferenceMapping())],
	}),
]
const agent = new Agent(manifest, behaviors, [numberOfTrySatisfied])

const channel = new Channel()

channel.subscribe(agent)

const context = ModelContext.create("1")
context.addItem(UserMessageItem.create("What is the meaning of life?"))

channel.deliver(
	new RequestInfereceEvent("1", new Date(), {
		model: "gpt-5.4",
		caller: agent,
		channel: channel,
		context: context,
	}),
)
