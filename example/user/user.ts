import { createParticipant, createBehavior } from "src"
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
