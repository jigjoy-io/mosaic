import { GenerativeModel } from "@domain/generative-model/generative-model"
import { CapabilitySpecification } from "../capability/specification";

export interface StreamingCapability {
	setStreaming(streaming: boolean): void
	getStreaming(): boolean
}

export class StreamingSpecification implements CapabilitySpecification {
    isSatisfiedBy(model: GenerativeModel): boolean {
        return model.specification.supportStreaming
    }
}
