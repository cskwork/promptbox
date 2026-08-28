# Intent: unique-slugs

- Date: 2026-08-28
- Type: brownfield
- Requested by: danny

## Problem

promptbox AGENTS.md declares: "Slugs are unique across categories; move rather
than copy." Nothing enforces this rule. An agent that adds `tools/foo.md` while
`apps/foo.md` exists ships both entries silently. The site then shows the same
item in two categories, which the rule exists to prevent.

## Evidence

- Rule exists — [verified: promptbox AGENTS.md, "Slugs are unique across
  categories; there is no entry filed under two of them, so move rather than
  copy"]
- No enforcement exists — [verified: grep for "slug" in astro.config.mjs,
  src/content/config.ts, package.json returns no uniqueness check]
- No duplicates today — [verified: sort/awk scan over src/content/*/*.md
  basenames, zero cross-category duplicates across 114 entries in 9 categories]
- Build is the validation step — [verified: promptbox AGENTS.md "There is no
  test suite. The build is the validation step."]

## Success criteria

- [ ] `npm run build` FAILS when two categories contain the same slug, with an
      error naming the slug and both categories.
- [ ] `npm run build` PASSES on the current tree (no duplicates exist).
- [ ] The `translations/` collection is exempt (its slugs mirror originals by
      design).
- [ ] Non-`.md` files (e.g. `.gitkeep`) are ignored.

## Out of scope / must not change

- No new npm dependencies.
- No new CI steps; the check rides `npm run build` (decision: option A).
- Page rendering, category order, schemas, and all existing content stay
  untouched.

## Constraints

- Must work on macOS/Linux and Windows Git Bash (existing dev quirks section
  applies; no shell-specific code — pure TypeScript in config.ts).

## Open questions

- none

## Researcher findings

Inline verification above (small area; separate researcher pass skipped —
the affected file is one config, read directly).
