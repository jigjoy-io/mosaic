import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event";
import { Participant } from "./participants/participant";

export abstract class Producer<C, T> {
    private readonly consumers: Participant[] = []

    abstract produce(contract: C): AsyncIterable<SemanticEvent<T>>
}