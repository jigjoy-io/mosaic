import type { Channel } from "../channel"
import type { Participant } from "../participant"

interface AgenticErrorOpts {
	message: string
	stack?: string
	source?: Participant
	enviornment?: Channel
}

export class AgenticError extends Error {
	private source?: Participant
	private environment?: Channel

	constructor({ message, stack, source, enviornment }: AgenticErrorOpts) {
		super()

		this.message = message
		this.stack = stack
		this.source = source
		this.environment = enviornment
	}

	getSource() {
		return this.source
	}

	getEnvironment() {
		return this.environment
	}
}
