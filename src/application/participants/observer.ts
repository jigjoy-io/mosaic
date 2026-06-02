import { AgenticError } from "@domain/agentic-environment/errors/base-error"
import { Observer } from "@domain/agentic-environment/participants/observer"
import { Participant } from "@domain/agentic-environment/participants/participant"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class BaseObserver extends Observer {
	onFunctionCall(item: FunctionCallItem) { }
	onExternalFunctionCall(source: Participant, item: FunctionCallItem) { }
	onFunctionCallOutput(item: FunctionCallOutputItem) { }
	onExternalFunctionCallOutput(source: Participant, item: FunctionCallOutputItem) { }
	onReasoning(item: ReasoningItem) { }
	onExternalReasoning(source: Participant, item: ReasoningItem) { }
	onModelMessage(item: ModelMessageItem) { }
	onExternalModelMessage(source: Participant, item: ModelMessageItem) { }
	onMessage(message: string) { }
	onJoined() { }
	onLeft() { }
	onParticipantJoined(participant: Participant) { }
	onParticipantLeft(participant: Participant) { }
	onInternalEvent(item: SemanticEvent<unknown>) { }
	onExternalEvent(source: Participant, item: SemanticEvent<unknown>) { }
	onError(error: AgenticError): void { }
	onParticipantError(source: Participant, error: AgenticError): void { }
}
