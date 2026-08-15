# 2026-08-15 — CLI tool catalog, prompter skill, and onboarding workflow rewrite (v0.5.0)

## Changes

- Added three CLI catalog entries under `tools/`: `gws` (Google Workspace CLI), Firebase CLI with its bundled MCP server, and `asc` (App Store Connect CLI).
- Added Aside as a `tools/` entry and the official `aside-browser` skill, using the upstream `SKILL.md` verbatim so the copy payload stays drop-in.
- Kept ego lite as the default macOS browser in the onboarding prompt after the Aside switch was reverted; the `aside-browser` skill remains available.
- Added the `prompter` skill and included it in the onboarding starter kit; refreshed its embedded payload with the `sync --mode pull/push` subcommand and its conflict exit codes.
- Added the `verify` skill card and included it in the onboarding starter kit.
- Introduced the domain rules file `~/.agents/rules/rules.md` in the onboarding prompt.
- Added stage "2. Options" — three ranked approaches presented before any plan or code.
- Replaced stage "7. Report" with the wait-what reporting format.
- Onboarding now installs every Matt Pocock skill and adds `skill-curator`.
- Stated the worktree merge stance and dropped the subagent model pin from onboarding.
- Corrected model names in the delegate instructions: `gpt-5.6-luna` and `opus-5`.
- Removed an internal branch name from the `superloop` skill.

## Verification

- `npm run build` passed with 105 generated pages.

## Compatibility

- No content schema, route, or build configuration changes.
- All additions are new entries under existing collections; existing entries and onboarding installation behavior remain compatible.
