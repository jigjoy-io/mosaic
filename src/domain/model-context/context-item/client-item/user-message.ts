import { ContextItem } from "@domain/model-context/context-item/context-item"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"

export class UserMessageItem extends ContextItem {
	readonly type = "message"
	readonly role = "user"
	readonly content: InputText

	private constructor(content: InputText) {
		super()
		this.content = content
	}

	static create(text: string): UserMessageItem {
		const content = InputText.create(text)
		return new UserMessageItem(content)
	}

	static rehydrate(data: { text: string }): UserMessageItem {
		const content = InputText.rehydrate(data)
		return new UserMessageItem(content)
	}

}
