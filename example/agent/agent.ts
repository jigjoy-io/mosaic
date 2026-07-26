import { FreemiumAvailable } from "./constraint"
import { FreemiumAction } from "./action"
import { createAgent, createBehavior } from "src"

const freemium = createBehavior({
	constraint: new FreemiumAvailable(),
	actions: [new FreemiumAction()],
})

const agent = createAgent({
	manifest: {
		name: "Agent",
		instruction: "You are a helpful assistant.",
		tools: [],
	},
	behaviors: [freemium],
})

export { agent }
