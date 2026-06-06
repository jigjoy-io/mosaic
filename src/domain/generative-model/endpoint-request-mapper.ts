import { ContextEndpointMapper } from "./capability/context";
import { ReasoningEffortEndpointMapper } from "./capability/reasoning-effort";
import { StreamingEndpointMapper } from "./capability/streaming";
import { ToolCallingEndpointMapper } from "./capability/tool-calling";
import { StructuredOutputEndpointMapper } from "./capability/structured-output";
    
export type EndpointRequestMapper = ToolCallingEndpointMapper &
                                    ReasoningEffortEndpointMapper &
                                    StreamingEndpointMapper &
                                    StructuredOutputEndpointMapper &
                                    ReasoningEffortEndpointMapper &
                                    ContextEndpointMapper;