import { Agent } from "@domain/agentic-environment/agent/agent"
import { AgentManifest } from "@domain/agentic-environment/participant-manifest"
import { runtime } from "src"
import { UserMessageEvent } from "./events/user-message-event"
import { runInferenceBehavior } from "./behaviors/run-inference"
import { FreemiumContract } from "./contracts/freemium"

const manifest = AgentManifest.create({
	id: "1",
	name: "Agent",
	instruction: "You are a helpful assistant.",
	tools: [],
})

const behaviors = [runInferenceBehavior]

const contract = FreemiumContract.create(3)
const agent = Agent.create({ manifest, behaviors, contract })

runtime.join(agent)

const userMessageEvent = UserMessageEvent.create("user", "What is the capital of France?")
runtime.deliver(userMessageEvent)
