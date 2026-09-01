import { defineRuntime, RuntimeState } from "src"

export class EnvironmentState extends RuntimeState {}

export const { initializeRuntime, resolveRuntime, resolveParticipant, join, leave, sendMessage, sendEvent, runLoop } =
	defineRuntime<EnvironmentState>()
