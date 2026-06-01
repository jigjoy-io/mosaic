# Tests

Mozaik's test suite is split into two layers, runnable independently.

| Command | Runs | Scope |
| --- | --- | --- |
| `npm run test:unit` | `tests/unit/**` | Domain + application logic in isolation. External dependencies are mocked through their domain ports. |
| `npm run test:integration` | `tests/integration/**` | Infrastructure layer — concrete provider runtimes (Anthropic Messages, OpenAI Responses, OpenAI-compatible Chat Completions, Gemini generateContent) and the in-memory repository. |
| `npm test` | everything | Full suite. |
| `npm run test:coverage` | everything | Adds an Istanbul coverage report under `coverage/`. |

## Integration tests do not make network calls

Provider runtimes are exercised through their **pure conversion methods**
(`mapContextToRequest`, `buildRequest`, `extractContextItems`,
`extractTokenUsage`) — a `ModelContext` of domain items in, a provider-shaped
request out, and a provider response back into domain items. This is the part
of the infrastructure layer that breaks silently in production (a malformed
tool-call shape → a 400 from the provider), so it is asserted exactly without
touching the wire.

`tests/setup.ts` seeds dummy provider API keys so the SDK clients can be
constructed in CI without real secrets. **Tests must never make a real API
call** — stub the SDK client if you need to exercise `infer()`/`stream()`
end to end.

## Shared helpers

`tests/helpers/` holds reusable doubles (e.g. `RecordingParticipant`, a fake
`GenerativeModel`). They are excluded from the suite glob, so they are not run
as test files.
