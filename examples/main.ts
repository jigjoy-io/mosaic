import { agent } from "./agent/agent"
import { ParticipantMessage } from "../src/domain/agentic-environment/events/participant-message"
import { EnvironmentState, FreemiumAccount, initializeRuntime } from "./runtime"
import { user } from "./user/user"

const freemiumAccount = FreemiumAccount.init(3)
const runtimeState = new EnvironmentState(freemiumAccount)

const runtime = initializeRuntime(runtimeState)

runtime.join(user)
runtime.join(agent)

const participantMessage = ParticipantMessage.create(user.getId(), "What is the capital of France?")
runtime.deliver(participantMessage)
