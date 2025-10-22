// Install types from your SDK file:
import type {
    ChatCompletion,
    ChatCompletionMessageParam,
    ChatCompletionToolMessageParam,
    ChatCompletionUserMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionDeveloperMessageParam,
    ChatCompletionAssistantMessageParam,
    ChatCompletionContentPart,
    ChatCompletionContentPartText,
    ChatCompletionContentPartImage,
    ChatCompletionMessageToolCall,
  } from "openai/resources/chat/completions"; // path matches your pasted file
import { ImagePart, Message, TextPart, ToolResultPart } from "../../core/capabilities";
  
  // --- tiny utils ---
  function safeJSON(x: unknown): string {
    if (typeof x === "string") return x;
    try { return JSON.stringify(x); } catch { return String(x); }
  }
  function safeParse(s?: string) {
    try { return s ? JSON.parse(s) : undefined; } catch { return s; }
  }
  function prefersDeveloperRole(model?: string) {
    // Adjust if you only want to switch for o1/o3/o4 models
    return !!model && model.startsWith("o1");
  }
  
  export class OpenAIMessageMapper {
    constructor(private model?: string) {}
  
    /** Domain -> OpenAI wire */
    toProvider(messages: Message[]): ChatCompletionMessageParam[] {
      const out: ChatCompletionMessageParam[] = [];
      const dev = prefersDeveloperRole(this.model);
  
      for (let m of messages) {
        // (A) Tool results as explicit role:"tool" messages (one per part)
        if (Array.isArray(m.content)) {
          const toolResults = (m.content as any[]).filter(p => p?.type === "tool_result") as ToolResultPart[];
          if (toolResults.length) {
            for (const tr of toolResults) {
              const toolMsg: ChatCompletionToolMessageParam = {
                role: "tool",
                tool_call_id: tr.tool_call_id,                           // REQUIRED by SDK
                // OpenAI allows string or array<text> here; stringify JSON payloads
                content: safeJSON(tr.result),
              };
              out.push(toolMsg);
            }
            // If the message ONLY carried tool_result parts, skip further mapping
            const nonToolParts = (m.content as any[]).filter(p => p?.type !== "tool_result");
            if (nonToolParts.length === 0) continue;
            // otherwise fall through to map any remaining text/image parts below
            m = { ...m, content: nonToolParts } as Message;
          }
        }
  
        // (B) Map role-specific constraints
        if (m.role === "system" || (m.role === "assistant" && dev)) {
          // For o1/* you might prefer developer instead of system; use `dev` flag if you want to swap.
          const role: "system" | "developer" = dev && m.role === "system" ? "developer" : (m.role as any);
          const contentArr: ChatCompletionContentPartText[] =
            typeof m.content === "string"
              ? [{ type: "text", text: m.content }]
              : (m.content as Array<TextPart | ImagePart>).map(p => {
                  if ((p as any).type === "text") return { type: "text", text: (p as TextPart).text };
                  // images are NOT allowed in system/developer; throw to surface misuse
                  if ((p as any).type === "image_url") {
                    throw new Error(`[mapper] ${role} messages cannot include image parts.`);
                  }
                  return { type: "text", text: "" };
                });
  
          if (role === "developer") {
            const msg: ChatCompletionDeveloperMessageParam = { role: "developer", content: contentArr };
            out.push(msg);
          } else {
            const msg: ChatCompletionSystemMessageParam = { role: "system", content: contentArr };
            out.push(msg);
          }
          continue;
        }
  
        if (m.role === "user") {
          // user supports text | image | input_audio | file (we map our two)
          const contentArr: ChatCompletionContentPart[] =
            typeof m.content === "string"
              ? [{ type: "text", text: m.content }]
              : (m.content as Array<TextPart | ImagePart>).map(p => {
                  if ((p as any).type === "text") return { type: "text", text: (p as TextPart).text };
                  if ((p as any).type === "image_url") {
                    const img = p as ImagePart;
                    const part: ChatCompletionContentPartImage = { type: "image_url", image_url: { url: img.url } };
                    return part;
                  }
                  return { type: "text", text: "" };
                });
  
          const msg: ChatCompletionUserMessageParam = { role: "user", content: contentArr };
          out.push(msg);
          continue;
        }
  
        if (m.role === "assistant") {
          // assistant content can be string or array<text|refusal>; images are NOT valid here
          if (typeof m.content === "string") {
            const msg: ChatCompletionAssistantMessageParam = { role: "assistant", content: m.content };
            out.push(msg);
          } else {
            const contentArr = (m.content as any[]).map(p => {
              if (p?.type === "text") return { type: "text", text: (p as TextPart).text };
              if (p?.type === "image_url") {
                throw new Error("[mapper] assistant messages cannot include image parts.");
              }
              return { type: "text", text: "" };
            }) as ChatCompletionContentPartText[];
            const msg: ChatCompletionAssistantMessageParam = { role: "assistant", content: contentArr };
            out.push(msg);
          }
          continue;
        }
  
        if (m.role === "tool") {
          // If you represent tool replies as a standalone role:"tool" message (not via ToolResultPart),
          // you MUST include the tool_call_id somewhere; since your Message type doesn't carry it
          // at top-level, we accept only string/array<text> here WITHOUT id — which OpenAI will reject.
          // Prefer ToolResultPart flow above. If you insist on role:"tool", add `tool_call_id` to Message.
          throw new Error(
            '[mapper] For role:"tool" messages, use ToolResultPart with tool_call_id so we can emit a proper ChatCompletionToolMessageParam.'
          );
        }
      }
  
      return out;
    }
  
    /** OpenAI wire -> Domain (single choice) */
    fromProviderChoice(choice: ChatCompletion.Choice) {
      const msg = choice?.message as any;
      const content = msg?.content;
  
      // Flatten text
      const text: string =
        typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content.map((p: any) => p?.text ?? "").join("")
            : (content ?? "");
  
      // Extract assistant tool calls
      const toolCalls: Array<{ id: string; name: string; args: unknown }> =
        (msg?.tool_calls ?? []).map((tc: ChatCompletionMessageToolCall) => ({
          id: (tc as any).id,
          name: (tc as any).function?.name,
          args: safeParse((tc as any).function?.arguments),
        }));
  
      return { text, toolCalls };
    }
  }
  