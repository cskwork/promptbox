import type { CategoryKey } from '~/content/config';

/**
 * Developer-picked onboarding kit shown on the homepage ("Start here").
 *
 * ONBOARDING_PICKS lists the hand-picked starter items in reading order; each must
 * resolve to a real, non-hidden content entry (slug + category). DeveloperPicks.astro
 * looks them up and skips any that go missing, so a typo degrades to a smaller grid
 * rather than a build error — but keep these in sync with src/content/.
 */
export interface OnboardingPick {
  category: CategoryKey;
  slug: string;
}

export const ONBOARDING_PICKS: OnboardingPick[] = [
  // orient + plan
  { category: 'skills', slug: 'grill-with-docs' },
  { category: 'skills', slug: 'improve-codebase-architecture' },
  { category: 'skills', slug: 'handoff' },
  // super* end-to-end suite
  { category: 'skills', slug: 'supergoal' },
  { category: 'skills', slug: 'superpm' },
  { category: 'skills', slug: 'superdesign' },
  { category: 'skills', slug: 'superoffice' },
  { category: 'skills', slug: 'superhacker' },
  { category: 'skills', slug: 'superqa' },
  // build your own + infra/CLIs
  { category: 'skills', slug: 'writing-great-skills' },
  { category: 'skills', slug: 'ssh-llm-connect' },
  { category: 'skills', slug: 'jk-jenkins-cli' },
  { category: 'skills', slug: 'figma-cli' },
  { category: 'mcps', slug: 'codebase-memory-mcp' },
  { category: 'tools', slug: 'supertonic-tts' },
  // autonomous loop
  { category: 'plugins', slug: 'autoresearch' },
];

/**
 * The single copy-paste prompt the visitor hands to their coding agent to install
 * (or update) the whole kit at once into a unified ~/.agents/ directory symlinked
 * into every CLI they have.
 *
 * Kept free of backtick characters so it survives this template literal verbatim.
 * KEEP IN SYNC with the fenced payload in
 * src/content/prompts/agents-quick-onboarding.md — that file is the catalog copy.
 */
export const INSTALL_PROMPT = `You are setting up my global AI coding-agent environment. Build ONE shared source of truth at ~/.agents/ and symlink it into every coding CLI I already have installed.

Rules:
- Be idempotent. If something already exists, UPDATE it to the latest instead of duplicating. If a path is
  already a link into ~/.agents, leave it.
- NEVER leave a config path empty. Put the new link in place BEFORE removing the original, and only ever back
  up a REAL file/dir, never a link. Safe order PER target:
    1. Confirm the ~/.agents source (file or dir) exists. If not, skip this target and say so -- do NOT touch the original.
    2. Create the link at a temp name beside the target (e.g. <path>.newlink).
    3. If link creation FAILED: delete the temp, leave the original untouched, report the exact error, move on.
       (Never reach step 4 on failure -- this is what caused empty config paths before.)
    4. Only now: if the original is a real file/dir, move it to <path>.bak-<timestamp>; then rename <path>.newlink to <path>.
  If any path ever ends up empty, restore it from its <path>.bak-* immediately.
- Resolve ~ to my home dir on the current OS, and pick the link type by TARGET TYPE (file vs directory):
    macOS/Linux: ln -s            (works for both files and directories, no elevation)
    Windows, a FILE:      New-Item -ItemType SymbolicLink (needs Developer Mode or admin). If denied,
                          fall back to New-Item -ItemType HardLink (same drive only, no elevation).
    Windows, a DIRECTORY: New-Item -ItemType SymbolicLink (needs Developer Mode or admin). If denied,
                          fall back to New-Item -ItemType Junction (no elevation). NEVER hardlink a directory --
                          mklink /H / hardlinks do not work on folders (this is why the skills links failed).
    If a fallback cannot apply (e.g. ~/.agents is on a different drive, so a junction/hardlink cannot span
    volumes), COPY instead and tell me it will not auto-update.
- Do not commit or push anything. Print a summary of created / updated / skipped / backed-up / restored at the end.

1. Create the unified directory
   - ~/.agents/AGENTS.md      my global system prompt (coding rules), shared by every tool
   - ~/.agents/skills/        every skill lives here, one folder per skill containing a SKILL.md
   - ~/.agents/.cache/        clones of the source repos, used for updates
   If ~/.agents/AGENTS.md is missing, fetch the latest from
   https://raw.githubusercontent.com/cskwork/coding-agent-rules/main/AGENTS.md
   If it already exists, keep my edits and just tell me it can be refreshed from that URL.

2. Install or update these skills into ~/.agents/skills/<name>/
   For each: clone into ~/.agents/.cache/ (or git pull if already there), then copy the
   folder that holds SKILL.md to ~/.agents/skills/<name>/ (overwrite to update).
   mattpocock/skills holds four of them — clone it once and copy all four.
     grill-with-docs                github.com/mattpocock/skills  -> skills/engineering/grill-with-docs
     improve-codebase-architecture  github.com/mattpocock/skills  -> skills/engineering/improve-codebase-architecture
     triage                         github.com/mattpocock/skills  -> skills/engineering/triage
     writing-great-skills           github.com/mattpocock/skills  -> skills/productivity/writing-great-skills   (reference for authoring/improving any skill)
     ssh-llm-connect                github.com/cskwork/ssh-llm-connect        (copy its SKILL.md; run install.sh per project when you need the SSH guard)
     claude-code-workflow-cheatsheet github.com/cskwork/claude-code-workflow-cheatsheet
     jk (Jenkins CLI)               github.com/avivsinai/jenkins-cli          (install the jk binary per its README, then add a SKILL.md so agents can drive it)
     autoresearch                   github.com/uditgoenka/autoresearch        (install per its README; it is a plugin/skill)
     call-agent                     github.com/cskwork/call-agent             (delegation skill -> routes to codex/agy/kiro/claude/notebooklm; copy its skills/call-agent folder, NOT its install.sh -- the symlink step below links it)
     handoff                        github.com/cskwork/handoff-skill -> skill (handoff packet workflow for pausing, resuming, or transferring work; copy skill/SKILL.md to ~/.agents/skills/handoff/SKILL.md)
   These are whole-repo skills (SKILL.md plus agents/ reference/ templates/) -- copy the ENTIRE repo into ~/.agents/skills/<name>/, not just SKILL.md:
     supergoal                      github.com/cskwork/supergoal-skill
     superpm                        github.com/cskwork/superpm-skill
     superdesign                    github.com/cskwork/superdesign-skill
     superoffice                    github.com/cskwork/superoffice-skills
     superhacker                    github.com/cskwork/superhacker-skill      (authorized security testing / CTF / learning only)
     superqa                        github.com/cskwork/superqa-skill          (browser QA on any site; after copying, also run: pip3 install textual playwright pyyaml && python3 -m playwright install chromium  -- needs Python 3.10+)

   Command-line tools in the kit (install the binary; no skill folder needed):
     rtk              Rust Token Killer -- a CLI proxy that cuts 60-90% of tokens on common dev commands.
                      Install: brew install rtk (macOS/Linux) OR cargo install --git https://github.com/rtk-ai/rtk (any OS with Rust).
                      It gets wired into each agent in step 4 via rtk init.
     playwright-cli   npm i -g @playwright/cli@latest    (github.com/microsoft/playwright-cli -- token-efficient Playwright browser
                      automation for agents: record/generate code, inspect selectors, take screenshots)

   Optional CLI tools (install only if you want them):
     supertonic-tts   npm i -g supertonic-tts    (local text-to-speech CLI)
     figma-cli        npm i -g figma-ds-cli       (Figma design-system CLI; add a SKILL.md wrapper so agents can drive it -> skills/figma-cli)

   Treat writing-great-skills as the authoring reference: whenever you create or improve a SKILL.md
   in ~/.agents/skills/, consult it first.

3. Symlink ~/.agents into every coding CLI I have
   Detect which are installed (config dir present or binary on PATH; use each tool's OS-correct
   config path). For each present tool, replace its global rules file with a symlink to
   ~/.agents/AGENTS.md -- the link NAME differs per tool (CLAUDE.md / AGENTS.md / GEMINI.md) but
   all point at the one file -- and where the tool has a global skills dir, link it to
   ~/.agents/skills (a DIRECTORY: on Windows that means a junction, never a hardlink). Use the safe
   link-before-backup order from the Rules above. Current (2026) per-tool paths:
     Claude Code   rules ~/.claude/CLAUDE.md             skills ~/.claude/skills
     Codex CLI     rules ~/.codex/AGENTS.md              skills ~/.codex/skills
     OpenCode      rules ~/.config/opencode/AGENTS.md    (AGENTS.md overrides CLAUDE.md here)
     Gemini CLI    rules ~/.gemini/GEMINI.md             Gemini's DEFAULT file is GEMINI.md, NOT AGENTS.md.
                     To use the AGENTS.md name instead, first add
                     "context": { "fileName": ["AGENTS.md", "GEMINI.md"] } to ~/.gemini/settings.json.
                     No global skills dir.
     Antigravity   rules ~/.gemini/GEMINI.md             Shares Gemini's global file (known conflict, issue #16058).
                     Per-workspace it NATIVELY reads a .agents/ dir (.agents/agents.md + .agents/skills/), so point
                     that skills dir at ~/.agents/skills too.
     Windsurf      per-repo AGENTS.md at the repo root   Renamed "Devin Desktop". AGENTS.md is always-on at the root;
                     project rules engine is .devin/rules/ (legacy .windsurf/rules/). No confirmed home-dir global file.
     Cursor        per-repo AGENTS.md at the repo root   (no global rules file; .cursor/rules/ for scoped extras)
     Kilo Code     rules ~/.config/kilo/AGENTS.md        (a project AGENTS.md overrides it; in-project AGENTS.md loads, then .kilocode/rules/)
     any other agents.md-compatible CLI -> its global config dir + skills dir
   Skip tools that are not installed and list which you skipped.

4. Enable shared agent tooling on the tools you detected in step 3
   a. rtk token proxy -- for each installed agent, run its rtk init so common dev/bash commands auto-rewrite to
      rtk and cut 60-90% of tokens (the rtk binary was installed in step 2):
        rtk init -g                    Claude Code (default)
        rtk init -g --agent cursor     Cursor
        rtk init -g --agent windsurf   Windsurf
        rtk init --agent cline         Cline / Roo Code
      rtk covers 14+ agents -- run rtk init --help to match each tool you have; skip any it does not support.
   b. codebase-memory-mcp -- a global MCP server that indexes your codebase into a persistent knowledge graph
      (158 languages, sub-millisecond queries, ~99% fewer tokens than reading files one by one). Install it once;
      its installer AUTO-DETECTS and configures the MCP for every agent you have (Claude Code, Codex, Gemini, and more):
        macOS/Linux:  curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash
        Windows:      iwr -Uri https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 -OutFile install.ps1; ./install.ps1
      If the auto-config misses a tool, add it to that tool's MCP config by hand (e.g. ~/.claude/.mcp.json):
        "codebase-memory-mcp": { "command": "<path-to-installed-binary>", "args": [] }
      Immediately after installation, disable background auto-indexing globally. This avoids watcher crashes on
      large repos, generated files, parent directories, and worktree folders that surface to agents as
      "Transport closed":
        codebase-memory-mcp config set auto_index false
        codebase-memory-mcp config list
      The config list MUST show auto_index = false.
      For every project, create a .cbmignore before the first index. Exclude generated files, dependency caches,
      agent state, worktrees, graph exports, local DB files, and SQL dumps. Good starter patterns:
        **/node_modules/
        **/dist/
        **/build/
        **/target/
        **/.gradle/
        **/.next/
        **/.nuxt/
        **/.cache/
        **/.venv/
        **/venv/
        worktrees/
        **/worktrees/
        .agents/
        .claude/
        .codex/
        .gemini/
        **/graphify-out/
        **/graph.json
        **/merged-graph.json
        **/*.db
        **/*.sqlite
        **/dump-*.sql
      Do NOT index a parent umbrella directory such as ~/Documents/.../Project. Index the actual repository root:
        codebase-memory-mcp cli index_repository '{"repo_path":"<absolute-project-root>","mode":"fast"}'
        codebase-memory-mcp cli list_projects
        codebase-memory-mcp cli index_status '{"project":"<project-name>"}'
      If MCP calls still fail with "Transport closed", use the CLI commands above to inspect the cache and restart
      the agent session; do not hide the failure as success.

5. Verify
   List ~/.agents/skills/, confirm every symlink resolves to ~/.agents, confirm rtk init ran for each agent and
   codebase-memory-mcp appears in each tool's MCP list, confirm auto_index=false, and confirm at least one target
   repo indexes successfully with fast mode, then print the created / updated / skipped / backed-up summary.`;
