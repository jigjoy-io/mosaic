import { Reaction } from "../participant"

export type DecisionRecord = {
	reactions: Reaction<unknown>[]
	reason?: string
}
