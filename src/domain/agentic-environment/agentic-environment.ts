import { Participant } from "@domain/agentic-environment/participants/participant"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgenticError } from "./errors/base-error"

export interface AgenticEnvironmentOptions {
	silent?: boolean
}

export class AgenticEnvironment {
	protected subscribers: Participant[] = []
	private name?: string
	private options?: AgenticEnvironmentOptions
	private showLogs?: boolean

	constructor(name?: string, opts?: AgenticEnvironmentOptions) {
		this.name = name
		this.options = opts

		this.showLogs = this.options?.silent !== false
	}

	subscribe(participant: Participant) {
		this.subscribers.push(participant)
		for (const subscriber of this.subscribers) {
			if (participant === subscriber) {
				participant.onJoined()
			} else {
				subscriber.onParticipantJoined(participant)
			}
		}
	}

	unsubscribe(participant: Participant) {
		const exists = this.subscribers.includes(participant)

		if (!exists) {
			return
		}

		participant.onLeft()

		this.subscribers = this.subscribers.filter((p) => p !== participant)

		for (const subscriber of this.subscribers) {
			subscriber.onParticipantLeft(participant)
		}
	}

	deliverFunctionCall(source: Participant, item: FunctionCallItem): void {
		this.deliverToSubscribers(source, {
			internal: (src) => src.onFunctionCall(item),
			external: (sub) => sub.onExternalFunctionCall(source, item),
		})
	}

	deliverModelMessage(source: Participant, item: ModelMessageItem): void {
		this.deliverToSubscribers(source, {
			internal: (src) => src.onModelMessage(item),
			external: (sub) => sub.onExternalModelMessage(source, item),
		})
	}

	deliverReasoning(source: Participant, item: ReasoningItem): void {
		this.deliverToSubscribers(source, {
			internal: (src) => src.onReasoning(item),
			external: (sub) => sub.onExternalReasoning(source, item),
		})
	}

	deliverFunctionCallOutput(source: Participant, item: FunctionCallOutputItem): void {
		this.deliverToSubscribers(source, {
			internal: (src) => src.onFunctionCallOutput(item),
			external: (sub) => sub.onExternalFunctionCallOutput(source, item),
		})
	}

	deliverMessage(source: Participant, message: string): void {
		this.deliverToSubscribers(source, {
			external: (sub) => sub.onMessage(message),
		})
	}

	deliverSemanticEvent(source: Participant, item: SemanticEvent<unknown>): void {
		this.deliverToSubscribers(source, {
			internal: (src) => src.onInternalEvent(item),
			external: (sub) => sub.onExternalEvent(source, item),
		})
	}

	deliverError(source: Participant, error: AgenticError) {
		this.deliverToSubscribers(source, {
			internal: (src) => {
				try {
					src.onError(error)
				} catch (error) {
					if (this.showLogs) {
						console.warn(`[AgenticEnvironment] Participant.onError() failed. Reason: ${error as Error}\n ${JSON.stringify({ error }, null, 2)}`)
					}
				} finally {
					src.markInactive(this)
				}
			},
			external: (sub) => {
				try {
					sub.onParticipantError(source, error)
				} catch (error) {
					if (this.showLogs) {
						console.warn(`[AgenticEnvironment] Participant.onError() failed. Reason: ${error as Error}\n ${JSON.stringify({ error }, null, 2)}`)
					}
				}
			},
		})
	}

	private getListeningParticipants(source: Participant) {
		return this.subscribers.filter(
			(sub) =>
				sub !== source &&
				(sub.getListeners().length === 0 || sub.getListeners().some((listener) => source instanceof listener)),
		)
	}

	private deliverToSubscribers(
		source: Participant,
		handlers: { internal?: (src: Participant) => void; external: (sub: Participant) => void },
	) {
		const authorizedListeners = this.getListeningParticipants(source)

		for (const subscriber of this.subscribers) {
			const isActive = subscriber.getEnvironmentState(this)

			if (isActive) {
				try {
					if (subscriber === source) {
						handlers?.internal?.(subscriber)
					} else if (authorizedListeners.includes(subscriber)) {
						handlers?.external?.(subscriber)
					}
				} catch (error) {
					this.handleError(subscriber, error as Error)
				}
			}
		}
	}

	private handleError(subscriber: Participant, error: Error) {
		if (error instanceof AgenticError) {
			return this.deliverError(subscriber, error)
		}

		const agenticError = new AgenticError({
			message: error.message,
			stack: error.stack,
			enviornment: this,
			source: subscriber,
		})

		return this.deliverError(subscriber, agenticError)
	}
}
