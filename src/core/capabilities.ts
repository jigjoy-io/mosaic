export interface Message {
    role: "system" | "user" | "assistant" | "tool"
    content: string | Array<TextPart | ImagePart>
  }


export type Provider = "openai" | "anthropic" | "local"
  
export interface TextPart { type: "text"; text: string }
export interface ImagePart { type: "image_url"; url: string }
export interface GenOpts { temperature?: number; maxTokens?: number }
export interface TextOut { text: string }


export interface ToolDef {
    name: string
    description?: string
    schema: Record<string, any>
}
  
export interface ToolCall {
    name: string
    args: unknown
}
  
export interface Trace {
    model: string
    provider: Provider
    inputTokens?: number
    outputTokens?: number
    costUSD?: number
    latencyMs?: number
    meta?: Record<string, unknown>
}

export interface ToolCallPart {
    type: "tool_call"
    name: string
    arguments: unknown // parsed JSON
}

/** REQUIRED: tool_call_id must be present to reply to a specific assistant call */
export interface ToolResultPart {
    type: "tool_result"
    tool_call_id: string   // REQUIRED by OpenAI ChatCompletionToolMessageParam
    result: unknown       // JSON-serializable
    name?: string
}

export interface TextGen {
    text(messages: Message[], opts?: GenOpts): Promise<TextOut>
}

export interface ToolSpec { name: string; description?: string, schema: Record<string, any>; invoke?: (args: any) => Promise<any>}
export interface ToolCall { name: string; args: unknown }
export interface ToolUse {
    withTools(messages: Message[], tools: ToolSpec[], opts?: GenOpts): Promise<{ text: string; toolCalls: ToolCall[] }>
}

export interface Vision {
    vision(messages: Message[], opts?: GenOpts): Promise<TextOut>
}
