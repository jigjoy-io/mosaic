import { SituationContext } from "./process"

export interface Interception<TResult> {
	apply(context: SituationContext): TResult
}
