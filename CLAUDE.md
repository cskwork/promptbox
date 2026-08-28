# promptbox agent instructions

Static collection site (Astro 5 + Tailwind 3 + Content Collections) hosted at
<https://cskwork.github.io/promptbox/>. It catalogs prompts, skills, plugins, harnesses,
hooks, configs, and MCP server snippets. New items appear on the site the moment
they land on `main`.

> **If a user gives you a URL or paste and says "add to promptbox" / "save as skill" /
> "add this prompt", carry out the One-shot add workflow at the bottom of this file
> end-to-end. Do not ask for the category, schema, or commit message again.
> Derive them from the artifact.**

## Categories

- `prompts/`: reusable LLM prompts such as system prompts and transformation templates
- `skills/`: single-purpose Claude Code, Codex, or Hermes `SKILL.md` definitions
- `plugins/`: **collections of skills** packaged as a coding-agent plugin or marketplace entry
- `harnesses/`: **the coding agent itself** or a workflow layer on top. Examples include Codex CLI add-ons, alternative agents, and harness builders. These items define how the agent runs, not which skill it loads.
- `hooks/`: lifecycle hook scripts such as `PreToolUse`, `PostToolUse`, and `Stop`. These scripts gate or augment tool calls. A repository often contains several scripts under `hooks/` and a `settings.json` snippet.
- `configs/`: whole-file agent system prompts such as `CLAUDE.md`, `AGENTS.md`, and `.cursorrules`
- `mcps/`: MCP server installation or usage snippets
- `tools/`: **standalone CLIs and binaries** that developers install and run directly, such as `orca`, `herdr`, `officecli`, and `ai-memory`. A tool may also expose an MCP endpoint or ship skills. Its main deliverable is still a program you run.
- `apps/`: **end-user applications**, usually self-hosted or graphical, such as `docmost`, `plane`, and `meetily`. You deploy and open an app. An agent does not load it.

### Category routing rules

| If the item is… | Put it in |
| --- | --- |
| Plain-text prompt template a user pastes into an LLM chat | `prompts/` |
| **One** skill definition with `name:` / `description:` / trigger logic | `skills/` |
| **Multiple** skills bundled as a plugin (`/plugin install …`, `gemini extensions install …`, `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/` layouts) | `plugins/` |
| A **coding agent itself**, or a workflow/runtime layer (`oh-my-codex`-like) wrapping one, or a harness builder (`Archon`-like) | `harnesses/` |
| Lifecycle hook scripts such as PreToolUse, PostToolUse, and Stop. Usually shipped as a `hooks/` directory plus a `settings.json` snippet | `hooks/` |
| A whole-file agent system prompt (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`) | `configs/` |
| MCP server install snippet or `mcpServers` JSON config, and that snippet is the whole item | `mcps/` |
| A CLI / binary you install and run yourself, even if it also serves MCP or ships hooks | `tools/` |
| A self-hosted or GUI application you deploy and open | `apps/` |

When categories overlap, **match the artifact's filename and packaging**. A `SKILL.md` goes in
`skills/`; a repo with `.claude-plugin/` + `skills/<many>/` goes in `plugins/`;
a repo whose entry point is `omx`/`omp`/`archon` CLI (and the skills are
secondary) goes in `harnesses/`; a repo whose primary deliverable is
`hooks/*.sh` + `settings.json` matchers goes in `hooks/`.

`mcps/` vs `tools/` is the one people get wrong. Ask what you install: if the
answer is "a JSON snippet pointing at something someone else runs", it is
`mcps/`; if you download a binary and run it, it is `tools/` even when MCP is
how agents talk to it. `ai-memory` ships a Rust binary, a server, hooks, and an
MCP endpoint. It lives in `tools/ai-memory.md`. **Slugs are unique across
categories**; there is no entry filed under two of them, so move rather than
copy.

If a source repo has no `SKILL.md` but the user says "add this as a skill", **you write
the SKILL.md** in the body (frontmatter + Markdown matching the SKILL.md spec) so the
detail page's "원문 복사" yields a directly drop-in `SKILL.md`. Example pattern in
`src/content/skills/ssh-llm-connect.md`.

## Frontmatter schema

These base fields apply to every category. `src/content/config.ts` is the
authoritative Zod schema:

```yaml
title: string            # display name (sidebar + card heading)
summary: string          # one-line KO description (cards, meta description, search)
summary_en?: string      # natural EN caption shown beneath the KO summary (cards + detail); not a literal translation
tags: string[]           # kebab-case; first 4 render on cards
source?: URL             # original repo / site; rendered as card footer link + detail-page button
author?: string
license?: string
order?: number           # lower = higher in sidebar within its category (default 100)
hidden?: boolean         # true = drafted; excluded from listings without deleting the file
```

Category-specific extra fields:

```yaml
# prompts/
use_case?: string

# skills/
trigger?: string
install?: string

# plugins/
harnesses?: string[]     # ["Claude Code", "Codex CLI", "Gemini CLI", "OpenCode", "Cursor", ...]
install?: string         # primary install one-liner; per-harness details in body

# harnesses/
base_agent?: string      # which agent it wraps or replaces (e.g., "OpenAI Codex CLI", "Claude Code SDK · Codex SDK · Pi", "자체 (Pi fork)")
languages?: string[]     # implementation languages (["TypeScript", "Rust"])
platforms?: string[]     # supported OS / runtime (["macOS", "Linux", "Windows", "WSL2", "Zed (ACP)"])
install?: string         # primary install one-liner

# hooks/
event?: string           # "PreToolUse" | "PostToolUse" | "Stop" | "SessionStart"; pick the dominant one
matcher?: string         # e.g. "Bash · WebSearch"
scope?: 'project' | 'global' | 'both'
deps?: string[]          # required binaries (["bash", "python3", "xmllint"])
install?: string

# configs/
target_file?: string     # filesystem location the agent loads (~/.claude/CLAUDE.md, ...)
tools?: string[]         # which tools read it (Claude Code, Codex CLI, Cursor, …)

# mcps/
server_name?: string
transport?: 'stdio' | 'sse' | 'http'

# tools/ and apps/ (identical field sets)
languages?: string[]     # implementation languages (["Rust"], ["TypeScript"])
platforms?: string[]     # supported OS / runtime (["macOS", "Linux", "WSL2"])
install?: string         # primary install one-liner
```

`title`, `summary`, `tags` are the practical minimum. Everything else is optional but
improves discoverability and the detail page.

## Body conventions

The body is both the on-page documentation **and** the clipboard payload (the "원문 복사"
button copies `entry.body`). So:

- Lead with 1–3 short H2 sections in Korean: *한 줄 / 언제 쓰는가 / 무엇을 하는가 / 함정*.
- Gloss each English jargon term once when it first appears in those Korean sections. For example,
  use `seam(테스트를 끼워 넣는 이음새)`, `repro(재현)`, or `deterministic(매번 같은 결과)`.
  This keeps the body readable for beginners. The fenced payload is exempt.
- Then a fenced code block containing the verbatim original (a `SKILL.md`, a JSON
  snippet, a prompt template). Use the right language tag (`markdown`, `json`, `text`, `yaml`).
- **Do not paraphrase the original.** Port it exactly so users can paste it back into
  their tools without surprise.
- If the original has YAML frontmatter, wrap the whole artifact in the code block,
  including the frontmatter, so the copy round-trips.
- Use ` ```` ` (four backticks) for the outer fence when the inner content also contains
  triple-backtick code blocks. Match the pattern in `src/content/skills/clone-personalize.md`.

## Global install

`CLAUDE.md` and `AGENTS.md` at the repo root are the *agent contract* for this
project. Symlink them into each CLI agent's global config so the agent in **any**
session already knows the routing rules, schema, and add workflow:

```bash
# 1. Clone promptbox to a canonical location on your machine
git clone https://github.com/cskwork/promptbox ~/promptbox

# 2. Symlink into each CLI agent you use

# Claude Code (global)
mkdir -p ~/.claude && ln -sf ~/promptbox/CLAUDE.md ~/.claude/CLAUDE.md

# OpenAI Codex CLI
mkdir -p ~/.codex && ln -sf ~/promptbox/AGENTS.md ~/.codex/AGENTS.md

# Google Gemini CLI: the default context file is GEMINI.md, not AGENTS.md
# (to use the AGENTS.md name instead, add "context":{"fileName":["AGENTS.md","GEMINI.md"]} to ~/.gemini/settings.json)
mkdir -p ~/.gemini && ln -sf ~/promptbox/AGENTS.md ~/.gemini/GEMINI.md

# OpenCode
mkdir -p ~/.config/opencode && ln -sf ~/promptbox/AGENTS.md ~/.config/opencode/AGENTS.md

# Google Antigravity reads per-project AGENTS.md
ln -sf ~/promptbox/AGENTS.md /path/to/your/repo/AGENTS.md

# Cursor / Windsurf use per-repo AGENTS.md
ln -sf ~/promptbox/AGENTS.md /path/to/your/repo/AGENTS.md

# Any other CLI that follows the agents.md spec uses the same pattern:
ln -sf ~/promptbox/AGENTS.md <agent-config-dir>/AGENTS.md
```

Windows (PowerShell):

```powershell
git clone https://github.com/cskwork/promptbox $HOME\promptbox

# Requires Developer Mode or admin terminal for symlinks
New-Item -ItemType SymbolicLink -Path "$HOME\.claude\CLAUDE.md" -Target "$HOME\promptbox\CLAUDE.md"
New-Item -ItemType SymbolicLink -Path "$HOME\.codex\AGENTS.md" -Target "$HOME\promptbox\AGENTS.md"
```

After this:

- Any session can say *"add this URL to promptbox as a skill"* and the agent already
  knows where the repo lives, the categories, the schema, and the deploy flow.
- Editing one file, either `~/promptbox/CLAUDE.md` or `AGENTS.md`, updates the contract
  everywhere. This avoids drift between tools.

## One-shot add workflow (memorize this)

Given a source URL or pasted artifact, do this end-to-end without asking the user
for any of the steps:

1. `cd ~/promptbox`, or find the repository with `git rev-parse --show-toplevel`
2. `git clone --depth=1 <url> .tmp-sources/<slug>` (or save the paste to a temp file)
3. Read the source's `SKILL.md` / `README.md` / config to:
   - decide the **category** using the routing table above
   - extract `title`, `summary`, `tags`, `source`, `author`, `license`
   - pull category-specific fields (`trigger`, `install`, `harnesses`, …)
4. Create `src/content/<category>/<slug>.md`:
   - frontmatter matching `src/content/config.ts`
   - body = 1–3 Korean H2 sections (when to use / what / gotchas) followed by a
     fenced code block holding the verbatim original payload
   - if the source has no `SKILL.md` but the user said "as a skill", **author the
     SKILL.md inside the code block** (pattern: `src/content/skills/ssh-llm-connect.md`)
5. Validate: `MSYS_NO_PATHCONV=1 BASE_PATH=/promptbox npx astro build` (on Windows Git Bash;
   plain `npm run build` on macOS/Linux/PowerShell)
6. Commit and push:

   ```bash
   git add src/content/<category>/<slug>.md
   git commit -m "feat(<category>): add <slug>"
   git push
   ```

7. ~60s later the item is live at `https://cskwork.github.io/promptbox/<category>/<slug>/`.

If the user added **multiple** items in one request, batch them into a single commit:

```bash
git commit -m "feat: add learn-codebase, fizzy, myfocus, ssh-llm-connect skills + superpowers plugin"
```

## Validation

```bash
npm run build
```

Fails on:

- frontmatter that doesn't match the Zod schema in `src/content/config.ts`
- broken internal links
- markdown that breaks Astro / MDX parsing

There is no test suite. The build is the validation step.

## What you must NOT do

- Don't add a new top-level category without updating `src/content/config.ts` in three
  places: the Zod collection, the `collections` export, and both `CATEGORY_ORDER` and
  `CATEGORY_META`. Current order is
  `['prompts', 'skills', 'plugins', 'harnesses', 'hooks', 'configs', 'mcps', 'tools', 'apps']`.
  `src/pages/index.astro`, `src/pages/[category]/[...slug].astro`, and
  `src/layouts/BaseLayout.astro` all derive their list from `CATEGORY_ORDER`
  (`[...CATEGORY_ORDER]`). Do **not** hand-edit a `COLLECTIONS` array in them; there
  isn't one to edit. `translations/` is a real collection but not a category: it holds
  full-body EN translations and never appears in navigation.
- Don't rewrite layout/components for a single item. Adjust schema or body content first.
- Don't commit `.tmp-sources/`, `dist/`, or `node_modules/`. They're gitignored.
- Don't change `astro.config.mjs`'s default `BASE` (`/promptbox`) unless the GitHub
  repository is renamed. CI auto-computes `base` from the repo name; the default is
  only for local `npm run dev`.
- Don't add backwards-compatibility fields, feature flags, or hypothetical-future
  knobs. Add the field when an actual item demands it.
- Don't fabricate `source` URLs or `license` strings. If unknown, omit the field.

## Local dev quirks

- **Windows + Git Bash**: env vars like `BASE_PATH=/promptbox` get rewritten by MSYS
  path conversion, breaking every link. Prefix with `MSYS_NO_PATHCONV=1` or use
  PowerShell (`$env:BASE_PATH = "/promptbox"`).
- `src/content/mcps/.gitkeep` keeps the folder tracked when empty. Once a real `.md`
  is in `mcps/`, the `.gitkeep` can be removed.

## Deploy

`git push origin main` triggers `.github/workflows/deploy.yml`:

1. Node 22, `npm ci`
2. Auto-compute `base` from `${GITHUB_REPOSITORY##*/}`
3. `npm run build`
4. Upload `dist/` → `actions/deploy-pages@v4`

Live URL: <https://cskwork.github.io/promptbox/>. Reachable ~60s after the workflow
turns green.

## Response and documentation style

- Lead with the decision or answer. Then the *why* in one short clause.
- Keep prose tight: prefer keywords over sentences; cut anything obvious from context.
- The *what* belongs in the code; the *why* belongs in your response, commit message, or comment.
- Comments: only when the reasoning is not obvious from the code. One line is usually enough.
- Curation copy in `src/content/*/*.md` is Korean-primary; always add a natural English caption in
  `summary_en` (rendered beneath the KO summary on cards + detail). Write idiomatic EN, not a literal
  translation. The verbatim original payload inside the code fence stays in its source language and
  must round-trip byte-for-byte.
