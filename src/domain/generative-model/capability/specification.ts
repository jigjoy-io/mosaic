import { GenerativeModel } from "@domain/generative-model/generative-model"

export interface CapabilitySpecification { 
    isSatisfiedBy(model: GenerativeModel): boolean
}