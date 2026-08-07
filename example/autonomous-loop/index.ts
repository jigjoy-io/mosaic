import { Behavior } from "@domain/agentic-environment/participant/behavior"
import { messageReceivedSituation } from "./situations/message-received"
import { functionCallRequestedSituation } from "./situations/function-call-requested"
import { functionCallCompletedSituation } from "./situations/function-call-completed"
import { inferenceCompletedSituation } from "./situations/inference-completed"

export const autonomousLoop = Behavior.create({
	name: "autonomous-loop",
	situations: [
		messageReceivedSituation,
		functionCallRequestedSituation,
		functionCallCompletedSituation,
		inferenceCompletedSituation,
	],
})
