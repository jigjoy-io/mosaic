import { AgenticError } from "@domain/agentic-environment/errors/base-error"
import { Human } from "@domain/agentic-environment/participants/human"
import { Participant } from "@domain/agentic-environment/participants/participant"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class BaseHuman extends Human {
	onJoined() { }

	onLeft() { }

	onParticipantJoined(participant: Participant) { }

	onParticipantLeft(participant: Participant) { }

	onMessage(message: string) { }

	onFunctionCall(item: FunctionCallItem) { }

	onFunctionCallOutput(item: FunctionCallOutputItem) { }

	onReasoning(item: ReasoningItem) { }

	onModelMessage(item: ModelMessageItem) { }

	onExternalFunctionCall(source: Participant, item: FunctionCallItem) { }

	onExternalFunctionCallOutput(source: Participant, item: FunctionCallOutputItem) { }

	onExternalReasoning(source: Participant, item: ReasoningItem) { }

	onExternalModelMessage(source: Participant, item: ModelMessageItem) { }

	onInternalEvent(item: SemanticEvent<unknown>) { }

	onExternalEvent(source: Participant, item: SemanticEvent<unknown>) { }

	onError(error: AgenticError): void { }

	onParticipantError(source: Participant, error: AgenticError): void { }
}
