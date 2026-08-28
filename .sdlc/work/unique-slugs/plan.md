# Plan: unique-slugs

- From: spec.md (approved 2026-08-28T10:29:29Z)
- Type: brownfield. Baseline required before any change.

## Files that change

- `src/content/config.ts` (modified) — append one module-scope block: the
  cross-category slug uniqueness check (R1). Imports added: `node:fs`,
  `node:path` (R5). No export is renamed, retyped, or removed (R6).

Nothing else. No new files, no package.json change, no CI change, no content
file change.

## Order of work

Each step leaves the tree green at its end. Steps 2–3 deliberately pass
through a red build with a TEMP file, but the temp file is deleted within the
same step.

1. **Regression baseline (no changes yet).** Run `npm run build` on the clean
   tree; save full output to `.sdlc/work/unique-slugs/baseline.txt`.
   (Captured by the BUILD stage — plan stage is read-only and must not create
   baseline.txt.) This is the before/after reference for every untouched check.
2. **Implement the check** in `src/content/config.ts`, per spec Behavior §1–5:
   resolve content root via `new URL('./', import.meta.url)`; `readdir` with
   file types; keep directories, skip `translations` (R3); in each remaining
   dir collect direct children ending `.md` or `.mdx` (R4), no recursion;
   key = lowercased collection-relative path minus extension; on any key with
   ≥2 entries throw an `Error` naming the slug, every category, and every file
   path (spec Error contract §4). Place at module scope, bottom of file (the
   module has no other side effects, so position is behavior-neutral).
   Verify: `npm run build` exits 0 (R2 — zero duplicates today).
3. **Negative proof — MANDATORY FIRST probe (R1 + hook mechanism).** Create a
   temp file `src/content/apps/agents-quick-onboarding.md` with minimal valid
   frontmatter (`title`, `summary`, `summary_en`) — it collides with
   `src/content/prompts/agents-quick-onboarding.md`. Run `npm run build`:
   EXPECT non-zero exit; output must contain the slug
   `agents-quick-onboarding`, both categories `prompts` and `apps`, and both
   file paths. **If the build instead PASSES, the module-load hook does not
   fire: STOP and reopen the spec** (spec B3 — do not ship a check that never
   fires). Delete the temp file; `npm run build` exits 0 again.
4. **Negative proof, `.mdx` variant (R4).** Same probe with
   `src/content/apps/agents-quick-onboarding.mdx` → build must fail naming the
   slug and both categories (proves `.mdx` participates per the FC2
   amendment). Delete the temp file; `npm run build` exits 0.
5. **Untouched checks + proof sweep** (commands below): `git diff --stat` shows
   only `src/content/config.ts`; export signature grep; U1/U3 dist greps;
   package.json untouched.

## Risks

- **Hook timing — the load-bearing assumption.** The whole design rests on:
  Astro 5.1.1's LEGACY content API imports `src/content/config.ts` during
  content sync at the start of BOTH `astro build` and `astro dev`, and a
  module-scope throw aborts with non-zero exit. The spec labels this
  [framework], never proven in this repo (adversarial finding B3). Mitigation:
  step 3 is mandatory and first; a silent pass means STOP + reopen spec, not a
  plan patch.
- **node builtins in an `astro:content` module.** `config.ts` currently
  imports only `astro:content`; the change adds `node:fs`/`node:path`.
  `@types/node` is in devDependencies [verified]. If the import fails in this
  context it surfaces in step 3 as a non-slug build error — same stop rule.
- **Dev server also gated (spec FC3).** With a duplicate present,
  `npm run dev` refuses to start — local browsing is blocked until the
  duplicate is fixed. Accepted fail-fast; flagged for the human in the spec.
- **Failure cosmetics (spec FC4).** The error surfaces as a thrown `Error`
  stack trace, not Astro's formatted overlay. Information is complete;
  cosmetics only.
- **Windows Git Bash (repo AGENTS.md quirks).** MSYS rewrites `VAR=/path`
  env args on Windows Git Bash, breaking `BASE_PATH`-style invocations. The
  proof commands here are plain `npm run build` — no env vars, so no rewrite
  exposure; if a `BASE_PATH` validation run is ever added on Git Bash, prefix
  `MSYS_NO_PATHCONV=1`. The check itself is cwd-independent
  (`new URL('./', import.meta.url)`) and involves no shell, so MSYS cannot
  affect it. Temp-file create/delete in Git Bash (`cp`/`rm`) is safe.
- **FC1 ceiling (accepted in spec).** Comparison key is the lowercased path,
  not full github-slugger folding; `café.md`/`cafe.md` would pass the check
  yet collide at runtime. Impossible today (all 114 basenames `[a-z0-9-]`).
- **FC5 blind spot (accepted in spec).** No recursion: a `.md`/`.mdx` in a
  subdirectory of a category is invisible to the check. Zero exist today;
  revisit if nested entries are ever introduced.
- **Regression vector.** The check is additive module-scope code; the only new
  failure mode on the clean tree is a crash at import (e.g. `readdir` error) —
  that shows immediately in step 2's build, and baseline.txt is the reference.

## Proof

Build command per `.sdlc/config.md`: `npm run build` (this repo's sole
validator — no test suite, no lint).

- **R1** → Step 3: temp `src/content/apps/agents-quick-onboarding.md` →
  `npm run build` exits non-zero; output contains `agents-quick-onboarding`,
  `prompts`, `apps`, `src/content/prompts/agents-quick-onboarding.md`,
  `src/content/apps/agents-quick-onboarding.md`. Temp deleted after.
- **R2** → Step 2: `npm run build` exits 0 on the clean tree with the check in
  place.
- **R3** → The diff shows `translations` explicitly skipped before any scan
  (`git diff src/content/config.ts` contains the skip), and the clean build
  passes with `src/content/translations/en/prompts/agents-quick-onboarding.md`
  present (spec's R3 command; also covers U5).
- **R4** → Step 4 `.mdx` probe fails as specified; clean build passes with
  `mcps/.gitkeep` present (non-`.md`/`.mdx` names ignored).
- **R5** → `git diff --stat` lists only `src/content/config.ts`;
  `git diff package.json` empty; diff adds imports only from `node:fs`,
  `node:path`.
- **R6** → `grep -n "^export" src/content/config.ts` before vs after shows the
  same four exports (`collections`, `CATEGORY_ORDER`, `CategoryKey`,
  `CATEGORY_META`) with unchanged right-hand sides; `npm run build` compiles
  all 8 importers (`Card.astro`, `DeveloperPicks.astro`, `HowItWorks.astro`,
  `Sidebar.astro`, `BaseLayout.astro`, `onboarding.ts`, `index.astro`,
  `[category]/[...slug].astro`).

## Regression baseline   <!-- brownfield -->

- Commands: `npm run build` (clean tree, BEFORE any edit), full output
- Saved to: `.sdlc/work/unique-slugs/baseline.txt` — **captured by the BUILD
  stage (step 1)**; the plan stage is read-only and does not create it.
- U1 (URL scheme `/{category}/{slug}/`) → build succeeds and
  `dist/promptbox/prompts/agents-quick-onboarding/index.html` exists
  (`test -f`).
- U2 (hidden-entry filtering) → `npm run build` succeeds (compile-render of
  all pages).
- U3 (CATEGORY_ORDER ordering) → category section ids in
  `dist/promptbox/index.html` appear in `CATEGORY_ORDER` order (grep ids from
  the built HTML, compare to the export).
- U4 (Zod validation of all 114 entries) → `npm run build` succeeds.
- U5 (translation lookup) → `npm run build` succeeds with the existing
  translations file present (it still resolves).
- U6 (check scripts + content untouched) → `git diff --stat` shows only
  `src/content/config.ts`.
- U7 (no new test suite/scripts) → `git diff package.json` empty.

## Deviations

- Builder implemented the check as an async module-scope IIFE; spec Data-shapes
  §3 promises a synchronous abort. Verifier flagged it: failure fired only via
  Node's unhandled-rejection default — deterministic today, but a race, not a
  contract. FIXED post-verification: readdirSync + plain block + synchronous
  throw; also fileURLToPath instead of URL.pathname (spaces/non-ASCII safe).
- Cosmetic quote reformat (single→double) widened the diff; behavior-neutral,
  caused by repo formatter.
- Plan U1 expected dist/promptbox/…; actual layout is flat dist/… (hrefs carry
  /promptbox). Substance of U1 holds.
