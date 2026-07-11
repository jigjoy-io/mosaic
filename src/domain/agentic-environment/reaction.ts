import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import type { AgenticError } from "./errors/base-error"
import type { Participant } from "./participant"
import type { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import type { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import type { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"

type MaybePromise<T> = T | Promise<T>

export interface ParticipantEventMap {
	functionCall: {
		item: FunctionCallItem
		source: Participant<unknown>
		origin: "self" | "external"
	}

	functionCallOutput: {
		item: FunctionCallOutputItem
		source: Participant<unknown>
		origin: "self" | "external"
	}

	reasoning: {
		item: ReasoningItem
		source: Participant<unknown>
		origin: "self" | "external"
	}

	modelMessage: {
		item: ModelMessageItem
		source: Participant<unknown>
		origin: "self" | "external"
	}

	message: {
		message: string
		source: Participant<unknown>
	}

	joined: {}

	left: {}

	participantJoined: {
		participant: Participant<unknown>
	}

	participantLeft: {
		participant: Participant<unknown>
	}

	error: {
		error: AgenticError
		source?: Participant<unknown>
	}
}

export type ParticipantReactions = {
	[K in keyof ParticipantEventMap]?: (event: ParticipantEventMap[K]) => MaybePromise<void>
}

export class LoggingObserver {
	protected readonly reactions = {
		reasoning: ({ source, item, origin }) => {
			console.log(origin, source.getManifest(), item)
		},

		functionCall: ({ source, item }) => {
			console.log(`${source.getManifest().name} called`, item)
		},

		error: ({ source, error }) => {
			console.error(source?.getManifest(), error)
		},

		functionCallOutput: ({ source, item }) => {
			console.log(`${source.getManifest().name} returned`, item)
		},

		modelMessage: ({ source, item }) => {
			console.log(`${source.getManifest().name} returned`, item)
		},

		message: ({ source, message }) => {
			console.log(`${source.getManifest().name} sent`, message)
		},

		joined: () => {
			console.log("joined")
		},

		left: () => {
			console.log("left")
		},

		participantJoined: ({ participant }) => {
			console.log("participant joined", participant.getManifest())
		},

		participantLeft: ({ participant }) => {
			console.log("participant left", participant.getManifest())
		},
	} satisfies ParticipantReactions
}
