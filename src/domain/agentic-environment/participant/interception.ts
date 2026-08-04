import { SituationContext } from "./situation"

export interface Interception<TResult> {
	apply(context: SituationContext): TResult
}
