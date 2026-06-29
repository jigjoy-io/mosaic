import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Participant } from "./participant"

export type Subscription = {
	eventType: string
	consumerId: string
	producerId: string
}

export class Channel {
	private participants: Participant<unknown>[] = []
	private subscriptions: Subscription[] = []

	deliver(event: SemanticEvent<unknown>): void {
		for (const subscription of this.subscriptions) {
			if (subscription.eventType === event.type && subscription.producerId === event.getProducerId()) {
				const consumer = this.participants.find((p) => p.getProfile().getId() === subscription.consumerId)
				if (consumer) {
					consumer.onEvent(event)
				}
			}
		}
	}

	join(participant: Participant<unknown>) {
		this.deliver(
			SemanticEvent.create({
				type: "participant-joined",
				producerId: participant.getProfile().getId(),
				data: participant.getProfile(),
			}),
		)
		this.participants.push(participant)
	}

	leave(participant: Participant<unknown>) {
		this.deliver(
			SemanticEvent.create({
				type: "participant-left",
				producerId: participant.getProfile().getId(),
				data: participant.getProfile(),
			}),
		)
		this.participants = this.participants.filter((p) => p !== participant)
	}

	subscribe(subscription: Subscription) {
		if (this.participants.some((p) => p.getProfile().getId() === subscription.consumerId)) {
			throw new Error("Participant is not joined to the channel")
		}

		if (
			this.subscriptions.some(
				(s) => s.eventType === subscription.eventType && s.producerId === subscription.producerId,
			)
		) {
			throw new Error("Subscription already exists")
		}

		if (this.participants.some((p) => p.getProfile().getId() === subscription.producerId)) {
			throw new Error("Producer is not joined to the channel")
		}

		this.subscriptions.push(subscription)
	}

	unsubscribe(subscription: Subscription) {
		if (!this.subscriptions.some((s) => s === subscription)) {
			throw new Error("Subscription does not exist")
		}

		this.subscriptions.filter((s) => s === subscription)
	}
}
