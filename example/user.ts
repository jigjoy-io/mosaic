import { createHuman } from "src"

const user = createHuman({
	name: "Miodrag",
	capabilities: ["review_code"],
	handlers: [],
})

export { user }
