# 2026-08-09 — Global operating instructions and Prime Agent catalog entry (v0.4.0)

## Changes

- Added Prime Agent as a harness catalog entry.
- Replaced the onboarding prompt's global operating instructions with the domain-first, seven-stage workflow.
- Added harness-aware subagent guidance: Luna with max reasoning or Opus with medium reasoning.
- Kept the live onboarding prompt and catalog copy synchronized.
- Preserved the existing hyphen-based Markdown bullets in the adversarial-review checklist.

## Verification

- `npm run build` passed with 98 generated pages.
- The live and catalog operating-instruction blocks matched exactly after TypeScript backtick decoding.
- The global canonical instruction file and all seven detected agent paths shared identical checksums.

## Compatibility

- No content schema, route, API, or migration changes.
- Existing Promptbox entries and onboarding installation behavior remain compatible.
