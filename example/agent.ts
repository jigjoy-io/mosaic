import { createAgent } from "src"

const agent = createAgent({
	manifest: {
		name: "Agent",
		instruction: "You are a helpful assistant.",
		tools: [],
	},
})

export { agent }
