# Evidence: unique-slugs

- From: plan.md (approved 2026-08-28)
- Diff: working tree vs `HEAD` — one file, `src/content/config.ts` (uncommitted by design; `.sdlc/` new + untracked)

## Human summary (read this first)

Promptbox entries are one file per slug. Nothing stopped the same slug from
living in two categories; a duplicate would ship silently and render twice.
This change adds a small check to `src/content/config.ts`. It runs every time
`npm run build` or `npm run dev` starts. If two categories hold the same slug
(`.md` or `.mdx`), the build stops with an error that names the slug, both
categories, and both file paths. The `translations/` folder is exempt on
purpose.

What was proven, in THIS pass, with fresh command runs:

- Clean tree with the check: build exits 0, 118 pages — same as baseline.
- Planted a real duplicate (`apps/agents-quick-onboarding.md` vs the existing
  `prompts/` file): build exits 1 with the full error — slug, both
  categories, both paths. Zero `unhandled` lines in the whole log, so the
  failure is the synchronous throw, not the async-IIFE race an earlier
  verifier caught (that was fixed before this pass; this pass re-attacked the
  fixed code fresh).
- Deleted the probe: build green again, 118 pages. The tree is exactly
  `M src/content/config.ts` + untracked `.sdlc/`.
- Untouched checks U1/U3 re-verified against a fresh `dist/`: the known
  entry page exists and home-page category sections still render in
  `CATEGORY_ORDER` order.

What was NOT proven: Windows Git Bash (no machine here), the dev-server gate
(skipped — long-running process; the probe covers build only). A fresh
adversary pass found no blockers; three small notes are listed below and none
change behavior.

What the reviewer must decide: approve the ship gate, then commit
`src/content/config.ts` together with `.sdlc/`. Nothing is staged; no
approval was recorded by this pass.

## Proof per requirement

All commands re-run fresh in THIS pass (ship stage), not quoted from earlier
artifacts.

- R1 (duplicate fails the build, error names slug + categories + paths):
  planted `src/content/apps/agents-quick-onboarding.md` (minimal valid
  frontmatter: title/summary/tags), then `npm run build` →

  ```text
  EXIT=1
  5:[GenerateContentTypesError] `astro sync` command failed to generate content collection types: Duplicate slug "agents-quick-onboarding" across categories: apps (src/content/apps/agents-quick-onboarding.md), prompts (src/content/prompts/agents-quick-onboarding.md). Slugs are unique across categories — move rather than copy (promptbox AGENTS.md).
  grep -ic "unhandled" /tmp/ship-probe-build.log → 0
  ```

  The stack confirms the mechanism: `at eval (src/content/config.ts:232:13)`
  inside Astro's content-sync (`astro sync`) — a synchronous module-scope
  throw, wrapped by Astro's own `GenerateContentTypesError` (nicer than the
  plain stack trace FC4 predicted). Probe file deleted immediately after;
  `git status --porcelain` back to `M src/content/config.ts` + `?? .sdlc/`.
- R2 (clean tree passes):
  `npm run build` →

  ```text
  EXIT=0
  19:50:46 [build] 118 page(s) built in 1.45s
  19:50:46 [build] Complete!
  ```

- R3 (translations exempt): clean build passes with
  `src/content/translations/en/prompts/agents-quick-onboarding.md` present —
  its slug mirrors `prompts/agents-quick-onboarding` and produces no error
  (R2 output above). Diff shows the skip:
  `if (!entry.isDirectory() || entry.name === "translations") continue;`
- R4 (`.md` + `.mdx` both checked; other names ignored): diff filters
  `if (!file.name.endsWith(".md") && !file.name.endsWith(".mdx")) continue;`
  — `.mdx` collides with `.md` via the shared extension-stripped key. This
  pass re-ran the `.md` probe; the `.mdx` variant probe was run by the build
  stage (probes.txt: exit 1, error names `.mdx` + `.md` paths) and the code
  path is shared, so no separate probe here.
- R5 (no new deps/scripts/CI; node builtins only):
  `git diff package.json` → empty (see Full checks).
  `git diff --stat` → only `src/content/config.ts`.
  New imports: `node:fs`, `node:path`, plus `node:url` for `fileURLToPath` —
  see Adversarial review finding N1; all three are Node builtins, zero
  npm-dependency change.
- R6 (exports unchanged): `grep -n "^export"` before vs after — same four
  names, same right-hand sides modulo recorded quote reformat:

  ```text
  121:export const collections = {            (HEAD: 118, same keys/order, multiline)
  138:export const CATEGORY_ORDER = [         (HEAD: 124)
  150:export type CategoryKey = ...           (HEAD: 136)
  167:export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {  (HEAD: 153)
  ```

  All 8 importers compile in the green build: Card.astro,
  DeveloperPicks.astro, HowItWorks.astro, Sidebar.astro, BaseLayout.astro,
  onboarding.ts, index.astro, `[category]/[...slug].astro`.

## Regression   <!-- brownfield -->

- Baseline vs after: clean. Baseline (`baseline.txt`, pre-change): exit 0,
  118 pages. After, three fresh runs this pass: clean 118 pages / probe exit
  1 / post-probe clean 118 pages. Page count identical to baseline; the only
  build-log difference is the check's presence (no new warnings).
- U1 (URL scheme `/{category}/{slug}/`): checked —
  `test -f dist/prompts/agents-quick-onboarding/index.html` → exists.
  (Plan recorded the layout deviation: files land flat under `dist/<cat>/<slug>/`;
  hrefs carry the `/promptbox` base. Same substance as the original U1.)
- U2 (hidden-entry filtering): checked — full build renders all pages, exit 0.
- U3 (CATEGORY_ORDER ordering): checked — section ids in fresh
  `dist/index.html`:

  ```text
  id="prompts" id="skills" id="plugins" id="harnesses" id="hooks"
  id="configs" id="mcps" id="tools" id="apps"
  ```

  — exactly `CATEGORY_ORDER` order (plus the non-category `id="main"` shell).
- U4 (Zod validation of all 114 entries): checked — build exit 0 with schemas
  untouched (schemas byte-identical modulo quotes).
- U5 (translation lookup): checked — build exit 0 with
  `translations/en/prompts/agents-quick-onboarding.md` present and resolving.
- U6 (check scripts + content untouched): checked — `git diff --stat` lists
  only `src/content/config.ts`; `git status` shows no content-file changes.
- U7 (no new test suite/scripts): checked — `git diff package.json` empty.

## Full checks

- Build: `npm run build` → exit 0, `118 page(s) built`, `Complete!` (clean
  and post-probe runs). Probe run: exit 1 as designed.
- Test: none exists in this repo (`npm run build` is the sole validator per
  repo AGENTS.md — U7 keeps it that way).
- Lint: none exists in this repo.
- `git diff package.json` → empty output.
- `git status --porcelain` (final):

  ```text
   M src/content/config.ts
  ?? .sdlc/
  ```

## Adversarial code review

Fresh-context pass by the ship agent against `roles/adversary.md`, attacking
the CURRENT (post-async-fix) diff. The earlier verifier's async-IIFE finding
was treated as history, not as clearance: the probe log was re-scanned for
`unhandled` (0 lines) and the stack was checked to be a synchronous throw at
`config.ts:232` during `astro sync`.

### Blocking (must fix before gate)

- None.

### Non-blocking (flag to human at gate)

- N1 — R5's letter lists builtins `node:fs` + `node:path`, but the diff also
  imports `node:url` (`fileURLToPath`). Evidence: diff lines 2–4. Rejected as
  blocker: plan.md Deviations explicitly records the fileURLToPath change
  (spaces/non-ASCII-safe vs `URL.pathname`), and `node:url` is a Node
  builtin — R5's intent (no new npm deps/scripts/CI) is intact.
- N2 — Cosmetic quote reformat (single→double, ~78 of 232 changed lines).
  Behavior-neutral, caused by repo formatter, recorded in plan.md Deviations;
  U3 + green build confirm rendering unchanged. Cost is blame noise on this
  file only.
- N3 — Scanner ceilings (all in the accepted FC1/FC5 family, none possible
  with today's tree): (a) a symlinked category directory is skipped —
  `Dirent.isDirectory()` is false for symlinks (under-strict, but no symlinks
  exist and spec's stated preference is over-strict for *extra* dirs, not
  symlink handling); (b) a file named exactly `.md`/`.mdx` would yield an
  empty slug key; (c) uppercase extensions (`Foo.MD`) are ignored. Zero such
  files exist today; the code comment already names the upgrade path
  (recursive walk + relative-path keys) if nested entries appear.
- N4 — With several distinct duplicate slugs present, the throw fires on the
  first one found; the author fixes iteratively. Standard fail-fast; spec's
  per-key throw semantics say the same.

### Checked and clean

- Spec mismatch: error message matches spec §4 example shape (slug, every
  category, every path, move-don't-copy hint); translations skip, `.md`+`.mdx`
  set, lowercased extension-stripped key, no recursion, module-scope position
  — all per spec/plan.
- Security: names-only `readdirSync` scan; no file content parsed, no
  eval/shell/network/secrets; error interpolates paths into an Error message
  only — no injection surface. `readdirSync` failure (EACCES/ENOENT)
  fail-fasts the build with a stack — acceptable for a build gate and named
  in plan Risks.
- Test theater: the negative probe cannot pass vacuously — the error text
  plus exit 1 are machine-checked, and the fix's signature (zero `unhandled`
  lines) was asserted, not assumed. Both directions observed live (fail with
  duplicate, pass without).
- Silently changed behavior: none beyond recorded deviations (N2). Exports,
  schemas, page rendering, and dist layout verified unchanged (U1–U7).

VERDICT: NO BLOCKERS

## Not verified

- Windows Git Bash: untested — no Windows machine in this pass. Static
  analysis says it is safe (`resolve(fileURLToPath(...))` handles drive
  letters; error paths are forward-slash template strings; no shell
  involved), matching the spec's platform edge case. This matches the plan's
  MSYS note (proof commands are plain `npm run build`, no env args to
  rewrite).
- Dev-server gate (spec FC3): not probed this pass — skipped to avoid a
  long-running process with a duplicate on disk. The mechanism is the same
  module load (`config.ts` imported during `astro dev` content sync), and
  Astro's dev sync shares the `astro sync` code path the probe exercised,
  but the dev-startup failure itself was not observed in THIS pass (nor in
  probes.txt — build-only there too).
- `.mdx` probe: not re-run this pass (build-stage probes.txt covers it; the
  code path is identical to the re-run `.md` probe apart from the suffix
  filter, which the diff shows).
- Case-variant collision (`Foo.md` vs `foo.md`), 3-category collision,
  in-collection duplicate behavior: not probed live — covered by code reading
  - spec edge cases; in-collection duplicates are out of scope by spec.

## Retro lessons

- Async IIFE at module scope is not a build gate; sync throw or top-level
  await. The earlier verifier caught it, the fix landed, and this pass's
  probe log shows the fix holding (0 `unhandled` lines, synchronous throw in
  the `astro sync` stack). → `.sdlc/memory/lessons/2026-08-28-async-iife-gate.md`
  [promote: skills/4-build — per the lesson's own note]
- New this pass: the adversary pass must re-attack post-fix code as if the
  fix were unproven — re-running the negative probe AND asserting the fix's
  mechanism signature (here: grep for `unhandled`, stack frame location)
  caught nothing new but is what makes "fixed" mean "verified". No lesson
  file added; the existing lesson covers the substance and this is process,
  not code.
