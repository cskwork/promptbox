# promptbox — agent instructions

Static collection site (Astro 5 + Tailwind 3 + Content Collections) hosted at
<https://cskwork.github.io/promptbox/>. It catalogs prompts, skills, plugins, configs,
and MCP server snippets. New items appear on the site the moment they land on `main`.

> **If a user gives you a URL or paste and says "add to promptbox" / "save as skill" /
> "add this prompt", carry out the One-shot add workflow at the bottom of this file
> end-to-end. Do not re-ask for category, schema, or commit message — they are all
> derivable from the artifact.**

## Categories

- `prompts/` — reusable LLM prompts (system prompts, transformation templates)
- `skills/` — single-purpose Claude Code / Codex / Hermes `SKILL.md` definitions
- `plugins/` — **collections of skills** packaged as a coding-agent plugin / marketplace entry
- `configs/` — whole-file agent system prompts (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`)
- `mcps/` — MCP server install/usage snippets

### Category routing rules

| If the item is… | Put it in |
|---|---|
| Plain-text prompt template a user pastes into an LLM chat | `prompts/` |
| **One** skill definition with `name:` / `description:` / trigger logic | `skills/` |
| **Multiple** skills bundled as a plugin (`/plugin install …`, `gemini extensions install …`, `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/` layouts) | `plugins/` |
| A whole-file agent system prompt (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`) | `configs/` |
| MCP server install snippet or `mcpServers` JSON config | `mcps/` |

Tie-breaker: **match the artifact's filename / packaging**. A `SKILL.md` goes in
`skills/`; a repo with `.claude-plugin/` + `skills/<many>/` goes in `plugins/`.

If a source repo has no `SKILL.md` but the user says "add this as a skill", **you write
the SKILL.md** in the body (frontmatter + Markdown matching the SKILL.md spec) so the
detail page's "원문 복사" yields a directly drop-in `SKILL.md`. Example pattern in
`src/content/skills/ssh-llm-connect.md`.

## Frontmatter schema

Shared base fields (every category — see `src/content/config.ts` for the
authoritative Zod schema):

```yaml
title: string            # display name (sidebar + card heading)
summary: string          # one-line description (cards, meta description, search)
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

# configs/
target_file?: string     # filesystem location the agent loads (~/.claude/CLAUDE.md, ...)
tools?: string[]         # which tools read it (Claude Code, Codex CLI, Cursor, …)

# mcps/
server_name?: string
transport?: 'stdio' | 'sse' | 'http'
```

`title`, `summary`, `tags` are the practical minimum. Everything else is optional but
improves discoverability and the detail page.

## Body conventions

The body is both the on-page documentation **and** the clipboard payload (the "원문 복사"
button copies `entry.body`). So:

- Lead with 1–3 short H2 sections in Korean: *한 줄 / 언제 쓰는가 / 무엇을 하는가 / 함정*.
- Then a fenced code block containing the verbatim original (a `SKILL.md`, a JSON
  snippet, a prompt template). Use the right language tag (`markdown`, `json`, `text`, `yaml`).
- **Do not paraphrase the original.** Port it exactly so users can paste it back into
  their tools without surprise.
- If the original has its own YAML frontmatter (skills, configs), wrap the whole thing
  in the code block — frontmatter included — so the copy round-trips.
- Use ` ```` ` (four backticks) for the outer fence when the inner content also contains
  triple-backtick code blocks. Match the pattern in `src/content/skills/clone-personalize.md`.

## Global install — make promptbox available from every session

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

# Google Gemini CLI
mkdir -p ~/.gemini && ln -sf ~/promptbox/AGENTS.md ~/.gemini/AGENTS.md

# OpenCode
mkdir -p ~/.config/opencode && ln -sf ~/promptbox/AGENTS.md ~/.config/opencode/AGENTS.md

# Google Antigravity — reads per-project AGENTS.md
ln -sf ~/promptbox/AGENTS.md /path/to/your/repo/AGENTS.md

# Cursor / Windsurf — per-repo AGENTS.md
ln -sf ~/promptbox/AGENTS.md /path/to/your/repo/AGENTS.md

# Any other CLI that follows the agents.md spec — same pattern:
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
- Editing one file (`~/promptbox/CLAUDE.md` or `AGENTS.md`) updates the contract
  everywhere — no per-tool drift.

## One-shot add workflow (memorize this)

Given a source URL or pasted artifact, do this end-to-end without asking the user
for any of the steps:

1. `cd ~/promptbox` (or wherever the repo lives — `git rev-parse --show-toplevel`)
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

- Don't add a new top-level category without updating **all of**:
  `src/content/config.ts` (Zod schema + `CATEGORY_META`), the `COLLECTIONS` arrays in
  `src/pages/index.astro` / `src/pages/[category]/[...slug].astro` / `src/layouts/BaseLayout.astro`.
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

## Response & documentation style

- Lead with the decision or answer. Then the *why* in one short clause.
- Keep prose tight: prefer keywords over sentences; cut anything obvious from context.
- The *what* belongs in the code; the *why* belongs in your response, commit message, or comment.
- Comments: only when the reasoning is not obvious from the code. One line is usually enough.
- Curation copy in `src/content/*/*.md` is Korean by default (matches the site's audience);
  the verbatim original payload stays in its source language.
