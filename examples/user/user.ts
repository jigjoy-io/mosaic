import { createParticipant } from "@app/use-cases/create-participant"
import { createBehavior } from "@app/use-cases/create-behavior"
import { ParticipantMessageConstraint } from "./constraint"
import { AnswerAction } from "./action"

const user = createParticipant({
	name: "User",
	behaviors: [
		createBehavior({
			constraint: new ParticipantMessageConstraint(),
			actions: [new AnswerAction()],
		}),
	],
})

export { user }
