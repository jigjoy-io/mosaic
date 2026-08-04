import { Behavior } from "@domain/agentic-environment/participant/behavior"
import { inferenceCompleted } from "./situations/inference-completed"
import { functionCallCompleted } from "./situations/function-call-completed"
import { functionCallRequested } from "./situations/function-call-requested"
import { messageReceived } from "./situations/message-received"

export const autonomousLoop = Behavior.create({
	name: "autonomous-loop",
	situations: [messageReceived, functionCallRequested, functionCallCompleted, inferenceCompleted],
})
