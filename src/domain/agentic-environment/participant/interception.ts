import { SituationContext } from "./situation"

export interface Interception<TResult> {
	id: string
	name: string
	apply(context: SituationContext): TResult
}
