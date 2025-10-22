import { GenOpts, Message , TextGen, TextOut } from "../../core/capabilities"
import { OpenAIModel } from "../../core/model"
import OpenAI from "openai/index"
import { OpenAIMessageMapper } from "../../mappers/openai/message-mapper"

export class OpenAIText implements TextGen {
    
    constructor(private model: OpenAIModel, private client = new OpenAI(), private mapper = new OpenAIMessageMapper()) {}

    async text(messages: Message[], opts?: GenOpts): Promise<TextOut> {

        const oaiMsgs = this.mapper.toProvider(messages);
        const r = await this.client.chat.completions.create({
            model: this.model, 
            messages: oaiMsgs, 
            temperature: opts?.temperature, 
            max_tokens: opts?.maxTokens
        })
        
        return { text: r.choices?.[0]?.message?.content ?? "" }
    }
}