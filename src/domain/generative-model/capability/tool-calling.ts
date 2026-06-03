import { Tool } from "@domain/generative-model/tool"
import { GenerativeModel } from "../generative-model"
import { CapabilitySpecification } from "./specification"

export interface ToolCallingCapability {
	setTools(tools: Tool[]): void
	getTools(): Tool[]
}

export class ToolCallingSpecification implements CapabilitySpecification {
    isSatisfiedBy(model: GenerativeModel): boolean {
        return model.specification.supportFunctionCalling
    }
}