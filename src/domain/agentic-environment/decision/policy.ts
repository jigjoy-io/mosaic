import { DecisionRecord } from "./record"

export interface DecisionPolicy<T> {
	decide(candidate: T): DecisionRecord
}
