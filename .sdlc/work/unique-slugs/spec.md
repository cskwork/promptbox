# Spec: unique-slugs

- From: intent.md (approved 2026-08-28)
- Type: brownfield

## Human summary (read this first)

Promptbox has a rule: an item's slug (its filename) must be unique across all
categories. Today nothing enforces it. A duplicate would ship silently and
show the same item in two categories.

We add a small check inside one existing file, `src/content/config.ts`. The
check runs every time `npm run build` or `npm run dev` starts. If two
categories hold the same slug, the build stops with an error that names the
slug, both categories, and both file paths. The `translations/` folder is
exempt on purpose — its slugs mirror originals by design. Both `.md` and
`.mdx` files are checked.

Nothing else changes: no new packages, no new scripts, no CI edits, no page
or schema changes. The current site builds clean because no duplicates exist
today.

Decisions taken at this gate: cover `.mdx` too (done); accents like
`café`/`cafe` are not folded (accepted — no such slugs exist); a duplicate
also blocks the dev server (accepted — failing fast is wanted); the error is
a plain stack trace, not a pretty overlay (accepted); files nested in
subfolders are not scanned (accepted — none exist).

Everything below is the agent-facing contract.

## Requirements

- R1: `src/content/config.ts` performs a cross-category slug uniqueness check at
  module load (before Astro content sync proceeds). When the same slug exists in
  two or more category collections, it throws an `Error` whose message names the
  slug and every colliding category with its file path. (intent: "`npm run
  build` FAILS when two categories contain the same slug, with an error naming
  the slug and both categories.")
- R2: The current tree passes the check — zero duplicates today [verified in
  intent: "sort/awk scan over src/content/*/*.md basenames, zero cross-category
  duplicates across 114 entries in 9 categories"; re-verified in research: `uniq
  -d` over all category `.md` basenames returns empty]. (intent: "`npm run
  build` PASSES on the current tree (no duplicates exist).")
- R3: The `translations/` directory is excluded from the scan entirely.
  (intent: "The `translations/` collection is exempt (its slugs mirror
  originals by design).")
- R4: Files ending in `.md` or `.mdx` participate (both become real entries
  under the installed `@astrojs/mdx` integration; slug = basename without the
  extension, so `foo.md` and `foo.mdx` also collide with each other). All
  other names (`.gitkeep`, dotfiles) are ignored. (intent: "Non-`.md` files
  (e.g. `.gitkeep`) are ignored" — amended at the spec gate: human resolved
  FC2 as "widen to .md + .mdx", 2026-08-28.)
- R5: No new npm dependencies, no new npm scripts, no CI changes. The check is
  pure TypeScript using node builtins (`node:fs`, `node:path`), inside
  `src/content/config.ts`. (intent: "No new npm dependencies." / "No new CI
  steps; the check rides `npm run build`" / "no shell-specific code — pure
  TypeScript in config.ts")
- R6: All existing exports of `config.ts` keep their names, types, and values:
  `collections`, `CATEGORY_ORDER`, `CategoryKey`, `CATEGORY_META`, and every
  collection schema. Eight files import from `~/content/config` [verified:
  grep — Card.astro, DeveloperPicks.astro, HowItWorks.astro, Sidebar.astro,
  BaseLayout.astro, onboarding.ts, index.astro, `[category]/[...slug].astro`],
  so any export change ripples. (intent: "Page rendering, category order,
  schemas, and all existing content stay untouched.")

## Data shapes

End-to-end pipeline. Repo-local facts are marked [verified] with the command
that backed them; framework behavior (how Astro treats slugs) is labeled
[framework] — the build stage must confirm it via the R1 negative test before
depending on it:

1. **Authoring shape.** An entry is `src/content/<category>/<slug>.md` with
   YAML frontmatter validated by per-collection Zod schemas in `config.ts`
   (shared `baseFields` + per-category extras). Nine category directories:
   `prompts, skills, plugins, harnesses, hooks, configs, mcps, tools, apps`.
   Plus `translations/` (exempt). All 114 category entries are flat files;
   basenames are all lowercase `[a-z0-9-]` [verified: grep for non-conforming
   basenames returned none]. One non-`.md` file exists: `mcps/.gitkeep`
   [verified]. One translations file exists:
   `translations/en/prompts/agents-quick-onboarding.md` [verified].
2. **Runtime shape (Astro 5.1.1, legacy content-collections API).** This repo
   uses the LEGACY API [verified: `defineCollection({ type: 'content', schema
   })` throughout config.ts; no `loader:` anywhere]: `src/content/config.ts`
   exports `collections`. It does NOT use the Astro 5 content-layer (no
   `loader: glob(...)`, no `entry.id`). Legacy entry runtime shape consumed by
   pages: `{ slug, body, data, render() }`, where `slug` = collection-relative
   path minus extension, slugified (github-slugger semantics: lowercased,
   ASCII-folded) [framework]. For this repo's flat lowercase basenames,
   `slug === basename` either way.
3. **Where the check hooks in.** Astro imports `src/content/config.ts` during
   content sync, which runs at the start of BOTH `astro build` and
   `astro dev`. Code at module scope of `config.ts` therefore executes before
   any content is loaded or page rendered. There is no collection-level
   validation hook in the legacy API (Zod schemas validate one entry at a
   time, so cross-entry constraints are impossible in the schema). A
   module-scope filesystem scan is the only in-`config.ts` hook. A throw
   aborts sync → build exits non-zero. `@types/node` is already in
   devDependencies (package.json).
4. **Error contract (R1).** Thrown message must contain, at minimum:
   - the duplicated slug,
   - every category that has it,
   - each colliding file path (e.g. `src/content/tools/foo.md`,
     `src/content/apps/foo.md`).
   Example shape (exact wording is implementation detail):
   `Duplicate slug "foo" across categories: tools (src/content/tools/foo.md),
   apps (src/content/apps/foo.md). Slugs are unique across categories — move
   rather than copy (promptbox AGENTS.md).`
5. **Comparison key.** Use the collection-relative path minus `.md`,
   lowercased, as the duplicate key. For flat lowercase files this equals the
   basename; lowercasing also catches case-variant collisions
   (`Foo.md` vs `foo.md`) that would collide at runtime after slugification.

## Behavior

Check algorithm (runs once, at config module load):

1. Resolve the content root from the module's own location
   (`new URL('./', import.meta.url)`) — cwd-independent, Windows-safe.
2. `readdir` the content root with file types; take directories only; skip
   `translations` (R3).
3. In each category directory, collect direct children whose name ends in
   `.md` (R4). No recursion — all category entries are flat today
   [verified: zero `.md` below depth 2 outside translations].
4. Build a map: key = lowercase path-minus-extension → list of
   `(category, path)`.
5. For every key with ≥2 entries, throw the R1 error listing all of them.

Edge cases:

- **Empty category dir** (`mcps/` today): only `.gitkeep` present → no `.md`
  → no entries, no error.
- **Case variants**: `tools/Foo.md` + `apps/foo.md` → same key → error (this
  is a real runtime collision after slugification, so failing is correct).
- **3+ categories sharing a slug**: error names all of them, not just two.
- **Duplicate inside one category**: out of scope — intent scopes the rule to
  "across categories". (No statement is made here about how Astro treats
  in-collection duplicates.)
- **Malformed frontmatter in some entry**: unchanged behavior — Zod schema
  errors still surface from Astro's own validation; this check runs on file
  names only and never reads frontmatter.
- **Non-collection directory at content root**: the scan treats every root
  directory except `translations` as a category. Today these are exactly the
  9 category collections [verified: `find src/content -mindepth 1 -maxdepth 1
  -type d` = apps, configs, harnesses, hooks, mcps, plugins, prompts, skills,
  tools, translations]. A future non-collection dir would be scanned too —
  over-strict, never under-strict.
- **Huge tree**: scan is a flat readdir per directory, O(entries); 114 today,
  trivially fast at any realistic size.
- **Platform**: pure `node:fs`/`node:path`; identical behavior on macOS,
  Linux, Windows Git Bash (constraint satisfied; no MSYS path-rewrite
  exposure because no shell is involved).

Verification commands (from `.sdlc/config.md`; build is the only validator
this repo has):

- R1 — **MANDATORY, run FIRST at build stage**: add a temp
  `src/content/apps/<existing-slug>.md`, run `npm run build`, observe
  non-zero exit + error naming slug and both categories; remove the temp
  file. This single test proves BOTH the requirement AND the module-load
  hook mechanism (config.ts is imported during content sync, `node:fs` is
  importable there). If it fails, the chosen hook point is wrong — stop and
  re-spec, do not ship a check that never fires.
- R2/R6: `npm run build` passes on the clean tree; `git diff` touches only
  `src/content/config.ts`.
- R3: `npm run build` passes with the existing
  `translations/en/prompts/agents-quick-onboarding.md` present (its slug does
  not collide with `prompts/agents-quick-onboarding` under the check).

## What stays untouched

<!-- brownfield regression baseline; all refs verified in current code -->

- U1: URL scheme `/{category}/{slug}/` — built from `entry.slug` in
  `src/pages/index.astro:54`, `src/pages/[category]/[...slug].astro:14,26,236,242`,
  `src/layouts/BaseLayout.astro:37`, `src/components/DeveloperPicks.astro:80`.
  The check must not alter slugs or URL construction. — checked by:
  `npm run build` succeeds and `dist/promptbox/<category>/<slug>/index.html`
  exists for a known entry (grep one path in dist).
- U2: Hidden-entry filtering `!e.data.hidden` in the four list consumers
  (`index.astro:12`, `BaseLayout.astro:25`, `[...slug].astro:36`,
  `DeveloperPicks.astro:14`). — checked by: `npm run build` succeeds (compile
  - render of all pages).
- U3: Category ordering from `CATEGORY_ORDER` (home grouping
  `index.astro:11-14`, sidebar `BaseLayout.astro:24`; export unchanged per
  R6). — checked by: order of category section ids in `dist/promptbox/index.html`
  matches `CATEGORY_ORDER` (machine-checkable grep).
- U4: Zod schema validation of all 114 entries (schemas unchanged per R6).
  — checked by: `npm run build` succeeds.
- U5: English-translation lookup via
  `translation.data.target === '<category>/<slug>'`
  (`[...slug].astro:29-34`). — checked by: `npm run build` succeeds; the
  existing translations file still resolves (build does not error on it).
- U6: `npm run check` scripts (`check:mirrors`, `check:prompt`,
  `scripts/check-mirrors.mjs`, `scripts/check-install-prompt.mjs`) and all
  content files untouched. — checked by: `git diff --stat` shows only
  `src/content/config.ts`.
- U7: No test suite is introduced; `npm run build` remains the sole
  validation step (repo AGENTS.md: "There is no test suite. The build is the
  validation step."). — checked by: `package.json` diff shows no new scripts.

## Flagged concerns

- [ ] FC1 — Slug-equivalence ceiling: the comparison key is the lowercased
  path; it does not replicate full github-slugger folding (diacritics,
  punctuation). A pair like `café.md` / `cafe.md` in two categories would
  collide at runtime yet pass this check. Today impossible: all 114 basenames
  are `[a-z0-9-]` [verified]. Accept the ceiling; revisit only if non-ASCII
  slugs ever appear. — owner: correctness (low)
- [x] FC2 — RESOLVED at gate (human, 2026-08-28): extend the suffix set to
  `.md` + `.mdx`. R4 amended accordingly. Rationale: `@astrojs/mdx` is
  installed, so `.mdx` files become real entries and could duplicate a slug
  unseen. — owner: content integrity (closed)
- [ ] FC3 — The check fires on `astro dev` too: with a duplicate present the
  dev server refuses to start. Desired fail-fast, but it means local browsing
  is blocked until fixed. Human: confirm acceptable. — owner: DX (low)
- [ ] FC4 — The failure surfaces as a thrown `Error` stack trace in the build
  log, not Astro's formatted error overlay. Information is complete (message
  carries slug + categories + paths); cosmetics only. — owner: DX (info)
- [ ] FC5 — No recursion: a `.md` inside a subdirectory of a category (e.g.
  `tools/sub/foo.md`) is invisible to the check. Zero nested `.md` exist today
  [verified: `find src/content -mindepth 3 -name "*.md" -not -path
  "*/translations/*"` = 0]. If nested entries are ever introduced, the check
  must switch to recursive walk + relative-path keys. — owner: future-proofing
  (low)

## Open questions from intent

- intent.md lists "Open questions: none" → nothing to answer or carry forward.

## Adversarial review

Second pass by the adversary checklist (roles/adversary.md) run against the
draft; objections written before fixes.

### Blocking

- B1 — Data-shapes header claimed "all facts verified in code", but the
  github-slugger slugification claim is framework behavior, not repo code —
  an overclaimed `[verified]`. → Resolution: header rewritten to split
  repo-verified facts (with commands) from [framework] claims; the R1
  negative test is now the mandated confirmation of the hook mechanism.
- B2 — Edge case asserted "Astro itself rejects in-collection slug
collisions" — unverified mechanism claim irrelevant to scope. → Resolution:
  claim deleted; scope note kept without the assertion.
- B3 — The module-load hook ("config.ts is imported during content sync;
  node:fs is importable there") was asserted, never proven. A spec built on
  an unproven hook is the wrong-shape bug the checklist warns about. →
  Resolution: R1 negative test marked MANDATORY and FIRST at build stage;
  spec instructs stopping and re-speccing if the hook does not fire.

### Non-blocking

- N1 — Case-folding comparison key goes slightly beyond intent's literal
  "same slug"; justified because runtime slugs are lowercased [framework], so
  case variants ARE the same slug. Kept, documented in Data shapes §5.
- N2 — U1/U3 checked-by commands were eyeball checks ("spot-check",
  "renders in order") — not machine-checkable. → Fixed: concrete greps of
  `dist/`.
- N3 — Missing edge cases: non-collection dir at content root (now covered:
  scanned, over-strict), huge tree (now covered: O(entries), trivial),
  no-recursion blind spot (now FC5).
- N4 — R6 understated blast radius (said pages "derive" from exports; actually
  8 files import from ~/content/config). → Importer list added.
- N5 — `.mdx` tension with intent's non-`.md` rule kept as FC2 for the human
  (correct per skill: flag, don't invent scope).

### Checked and clean

- Traceability: all 4 success criteria → R1–R4; all 3 out-of-scope items →
  R5/R6 + U-section; constraint → R5 + platform edge case; open questions:
  none in intent, none dropped.
- Edge cases from checklist: empty (mcps/.gitkeep), malformed frontmatter
  (names-only scan, untouched), platform (pure node), concurrent/unauthorized
  — N/A for a single-threaded static-site build.
- Testability: every R has a command; every U has a checked-by.
- No diff yet (spec stage); scope-creep scan of the planned diff: one file,
  module-scope read-only scan, no export changes.

VERDICT: 0 remaining blockers (3 found, all resolved above)
