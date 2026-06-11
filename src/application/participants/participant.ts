import type { AgenticError } from "@domain/agentic-environment/errors/base-error"
import { Participant } from "@domain/agentic-environment/participant"
import type { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import type { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import type { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import type { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class BaseParticipant extends Participant {
	onFunctionCall(_item: FunctionCallItem) {}
	onExternalFunctionCall(_source: Participant, _item: FunctionCallItem) {}
	onFunctionCallOutput(_item: FunctionCallOutputItem) {}
	onExternalFunctionCallOutput(_source: Participant, _item: FunctionCallOutputItem) {}
	onReasoning(_item: ReasoningItem) {}
	onExternalReasoning(_source: Participant, _item: ReasoningItem) {}
	onModelMessage(_item: ModelMessageItem) {}
	onExternalModelMessage(_source: Participant, _item: ModelMessageItem) {}
	onMessage(_message: string) {}
	onJoined() {}
	onLeft() {}
	onParticipantJoined(_participant: Participant) {}
	onParticipantLeft(_participant: Participant) {}
	onInternalEvent(_item: SemanticEvent<unknown>) {}
	onExternalEvent(_source: Participant, _item: SemanticEvent<unknown>) {}
	onError(_error: AgenticError): void {}
	onParticipantError(_source: Participant, _error: AgenticError): void {}
}
