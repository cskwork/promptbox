# Lesson: async IIFE at module scope is not a build gate

- Date: 2026-08-28
- Tags: astro, vite, module-load, async, build-gate, config.ts
- Feature: unique-slugs
- Stage: 4-build

## Trap

A module-scope validation check written as `(async () => { ... throw ... })()`
does not abort module evaluation. The build failed only through Node's default
unhandledRejection=throw — an environment default, not a language guarantee.
Probes passed 3/3, hiding the race.

## Correct move

Build-blocking checks at module scope must be synchronous (readdirSync +
direct throw) or top-level await. Also: use fileURLToPath(import.meta.url),
never URL.pathname (percent-encoding breaks on spaces/non-ASCII).

## Promote?

skills/4-build: add to Execute — "a check that must fail the build must fail
it synchronously; an unawaited promise is not a gate."
