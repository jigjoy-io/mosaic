import { agent } from "./agent"
import { ParticipantMessage } from "../src/domain/agentic-environment/events/participant-message"
import { EnvironmentState, FreemiumAccount, initializeRuntime } from "./runtime"

const freemiumAccount = FreemiumAccount.init(3)
const runtimeState = new EnvironmentState(freemiumAccount)

const runtime = initializeRuntime(runtimeState)

runtime.join(agent)

const participantMessage = ParticipantMessage.create("user", "What is the capital of France?")
runtime.deliver(participantMessage)
