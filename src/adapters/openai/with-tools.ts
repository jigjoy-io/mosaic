import OpenAI from "openai/index"
import { GenOpts, Message, ToolSpec, ToolUse } from "../../core/capabilities"
import { OpenAIMessageMapper } from "../../mappers/openai/message-mapper"
import { OpenAIModel } from "../../core/model"

export class OpenAITools implements ToolUse {

    constructor(private model: OpenAIModel, private client = new OpenAI(), private mapper = new OpenAIMessageMapper() ) {}

    async withTools(messages: Message[], tools: ToolSpec[], opts?: GenOpts) {
 
        const oaiMsgs = this.mapper.toProvider(messages);
        const r = await this.client.chat.completions.create({
            model: this.model,
            messages: oaiMsgs,
            tools: tools.map(t => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.schema } })), 
            tool_choice: "auto",
            temperature: opts?.temperature,
            max_tokens: opts?.maxTokens,
        })

        const m = r.choices?.[0]?.message
        
        return {
            text: m?.content ?? "",
            toolCalls: (m?.tool_calls ?? []).map((c: any) => ({ name: c.function.name, args: JSON.parse(c.function.arguments) }))
        }
    }
}