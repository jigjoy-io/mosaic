import { Agent } from "@domain/agentic-environment/agent/agent"
import { AgentManifest } from "@domain/agentic-environment/participant-manifest"
import { runtime } from "src"
import { freemiumBehavior } from "./behaviors/freemium-behavior"
import { ParticipantMessage } from "../src/domain/agentic-environment/events/participant-message"

const manifest = AgentManifest.create({
	id: "1",
	name: "Agent",
	instruction: "You are a helpful assistant.",
	tools: [],
})

const behaviors = [freemiumBehavior]

const agent = Agent.create({ manifest, behaviors })

runtime.join(agent)

const participantMessage = ParticipantMessage.create("user", "What is the capital of France?")
runtime.deliver(participantMessage)
