import { Reaction } from "../participant"

export type DecisionRecord = {
	reactions: Reaction[]
	reason?: string
}
