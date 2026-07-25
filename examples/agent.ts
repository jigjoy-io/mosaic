import { createEventProcessor } from "@app/use-cases/create-reaction"
import { FreemiumAvailable } from "./constraints"
import { FreemiumAction } from "./freemium-request"
import { AgentManifest } from "@domain/agentic-environment/participant-manifest"
import { Agent } from "@domain/agentic-environment/agent/agent"

const freemium = createEventProcessor({
	when: new FreemiumAvailable(),
	then: [new FreemiumAction()],
})

const manifest = AgentManifest.create({
	id: "1",
	name: "Agent",
	instruction: "You are a helpful assistant.",
	tools: [],
})

const eventProcessors = [freemium]

const agent = Agent.create({ manifest, eventProcessors })

export { agent }
