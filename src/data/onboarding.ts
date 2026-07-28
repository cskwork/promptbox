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
  // start here — the router over everything else
  { category: 'skills', slug: 'ask-matt' },
  { category: 'skills', slug: 'setup-matt-pocock-skills' },
  // orient + plan
  { category: 'skills', slug: 'grill-with-docs' },
  { category: 'skills', slug: 'improve-codebase-architecture' },
  { category: 'skills', slug: 'triage' },
  { category: 'skills', slug: 'handoff' },
  // build + verify
  { category: 'skills', slug: 'tdd' },
  { category: 'skills', slug: 'prototype' },
  { category: 'skills', slug: 'diagnose' },
  { category: 'mcps', slug: 'codebase-memory-mcp' },
  // super* end-to-end suite
  { category: 'skills', slug: 'supergoal' },
  { category: 'skills', slug: 'superpm' },
  { category: 'skills', slug: 'superdesign' },
  { category: 'skills', slug: 'superoffice' },
  { category: 'skills', slug: 'superhacker' },
  { category: 'tools', slug: 'ego-lite' },
  // build your own
  { category: 'skills', slug: 'writing-great-skills' },
  // design + docs + media
  { category: 'skills', slug: 'hallmark' },
  { category: 'skills', slug: 'archify' },
  { category: 'skills', slug: 'gpt-image-2' },
  { category: 'tools', slug: 'officecli' },
  // infra + cost
  { category: 'tools', slug: 'herdr' },
  { category: 'skills', slug: 'context-diet' },
  // autonomous loop
  { category: 'plugins', slug: 'autoresearch' },
];

/**
 * The single copy-paste prompt the visitor hands to their coding agent to install
 * (or update) the whole kit at once into a unified ~/.agents/ directory symlinked
 * into every CLI they have.
 *
 * Backtick characters in the prompt must be escaped for this template literal.
 * KEEP IN SYNC with the fenced payload in
 * src/content/prompts/agents-quick-onboarding.md — that file is the catalog copy.
 */
export const INSTALL_PROMPT = `Set up and maintain a global coding-agent environment on native macOS or Windows PowerShell.
The process must be IDEMPOTENT and SELF-HEALING: if an item already exists, update or repair it —
never duplicate it, never delete my work to make room for it.

=== 0. GROUND RULES (apply to every phase) ===

DEFINITION OF "INSTALLED". A skill counts as installed only if <skills-dir>/<name>/SKILL.md is
READABLE and non-empty. A directory that exists is not evidence of anything — an interrupted
installer leaves empty directories with correct names, and every agent then reports the skill as
missing while the filesystem claims it is there. Never test with [ -d ... ].

NEVER DESTROY TO INSTALL. Do not run rm -rf, git clean, or any recursive delete on a path you did
not create in this run. To replace something, mv it into the timestamped backup directory first.
This applies to upstream installer scripts too: read them before running them, and if one does
rm -rf on existing targets, do not run it — reimplement its linking step with backup semantics.

GLOBAL SCOPE ONLY. Many tools ship an "install" command that claims to be global but writes into
the current working directory's repository. Before running any third-party installer, run its
--dry-run and read the file list. If it would touch a file inside a git repository you did not
create, do not run it in that mode; restrict it to global-only flags/platforms. If a repo file is
modified anyway, revert that hunk and report it.

DO NOT PASS FLAGS TO YOUR OWN SCRIPTS THAT THEY DO NOT IMPLEMENT. A script that ignores an
unrecognised --dry-run will silently perform its real, mutating work while you believe you are
inspecting. Verification must use a separate, provably read-only script.

RESOLVE INTERPRETERS TO ABSOLUTE PATHS. Version managers (nvm, pyenv, rbenv) frequently do not
initialise in a non-interactive shell — 'node' may resolve to a broken shim. Detect the real
binary path once and use it everywhere.

=== 1. DETECTION ===

Detect OS, architecture, Git, Node.js, Python 3.10+, and available package managers. For each
interpreter record the ABSOLUTE PATH THAT ACTUALLY WORKS IN A NON-INTERACTIVE SHELL.

Identify installed agents: Claude Code, Codex, Kiro, Antigravity/agy, Gemini CLI, OpenCode, Cursor.
For each, record its global instruction file path and its global skills directory path — and
whether each is currently a real file/directory, a symlink, or absent.

Treat WSL as a separate environment and perform detection independently within it.

=== 2. PRE-FLIGHT INVENTORY (before touching anything) ===

Write ~/.agents/setup-backups/<timestamp>/inventory.tsv recording, for EVERY entry in every agent
skills directory and for every instruction file:

  path <TAB> kind(symlink|dir|file|absent) <TAB> target(if symlink) <TAB> has_SKILL.md

This inventory is the restore manifest. I keep my own symlinks pointing at personal repositories
outside ~/.agents; without this record you cannot tell a skill you installed from one I hand-linked,
and a later repair will silently drop mine. Treat any symlink whose target lies outside
~/.agents/sources as USER-OWNED: never retarget it, and restore it verbatim if a later step
removes it.

=== 3. LAYOUT AND BACKUP ===

  ~/.agents/sources/<owner>/<repo>     upstream repositories (shallow clones)
  ~/.agents/skills/                    canonical skills — one entry per skill
  ~/.agents/work/                      setup scripts and subagent briefs
  ~/.agents/docs/                      operator notes
  ~/.agents/install-manifest.json      machine-readable state
  ~/.agents/setup-backups/<timestamp>/ everything replaced this run

Back up every file BEFORE modifying it. Backups are timestamped and additive; never overwrite a
previous run's backup directory. Record the active backup path in ~/.agents/.last-backup.

=== 4. INSTALL SKILLS ===

Clone or update once into ~/.agents/sources/<owner>/<repo>. Prefer each repository's official Agent
Skills installer ONLY IF it is non-interactive and non-destructive; otherwise clone and link yourself.

  Matt Pocock Skills, incl. ask-matt  https://github.com/mattpocock/skills
  Context Diet                        https://github.com/cskwork/context-diet-skill
  Autoresearch                        https://github.com/uditgoenka/autoresearch
  Call Agent                          https://github.com/cskwork/call-agent
  Archify                             https://github.com/tt-a1i/archify
  Hallmark                            https://github.com/Nutlope/hallmark
  GPT Image 2                         https://github.com/agentspace-so/agent-skills/tree/main/gpt-image-2
  Codebase Memory MCP (CLI + MCP)     https://github.com/DeusData/codebase-memory-mcp
  OfficeCLI                           https://github.com/iOfficeAI/OfficeCLI
  Herdr                               https://github.com/ogulcancelik/herdr
  ego-browser (browser QA + web automation)  https://github.com/citrolabs/ego-lite
    macOS ONLY. This is the browser layer for this kit — see step 5b for the app install.
    Skill-only route: npx skills add citrolabs/ego-lite
    Installing the ego lite app also registers the skill into every agent skills directory, so run
    step 5b FIRST and then reconcile: if <skills-dir>/ego-browser already exists and points at
    ~/.local/share/ego/ego-skills, treat it as INSTALLED and do not clone a second copy.
    DO NOT install Playwright, Puppeteer, Selenium, or any headless-Chromium stack for browser
    testing. ego lite replaces them and reuses my real logged-in session. If a previous run of this
    setup installed the SuperQA skill or a playwright/chromium download, leave the existing files
    alone but report them as SUPERSEDED and tell me the exact uninstall command — do not run it.

Derive each skill's canonical name from its SKILL.md frontmatter 'name:' field, not from the
directory name, and fail loudly on a collision instead of silently overwriting.

This setup's global rules require agents to open ask-matt automatically. After every clone/update,
resolve the canonical ask-matt SKILL.md through its installed link and make it model-invokable:
  - Back up the file before the first change.
  - If frontmatter says 'disable-model-invocation: true', change only that value to false.
  - If it is already false or the field is absent, leave it unchanged.
  - Do not change this flag for any other skill.
Treat this normalization as part of installation and repair, so reruns cannot restore the upstream
user-invoked default and silently hide ask-matt from an agent's available-skills catalog.

=== 5. INSTALL STANDALONE TOOLS ===

Install or update via the official package manager. USE THE SAME MECHANISM THE TOOL IS ALREADY
INSTALLED WITH — switching from a curl installer to Homebrew (or pip to uv) leaves two binaries on
PATH and the wrong one wins.

  Codebase Memory MCP
    macOS/Linux: curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash
    Windows: download and inspect install.ps1 from the repository, then run it in PowerShell
    Require v0.9.0 or newer before enabling automatic indexing.
    Before restarting any agent, create a reviewed .cbmignore in every active repository root.
    Then run, in this order:
      codebase-memory-mcp config set auto_index_limit 50000
      codebase-memory-mcp config set auto_watch true
      codebase-memory-mcp config set auto_index true
      codebase-memory-mcp config list
  OfficeCLI           brew install officecli
  Herdr               official installer, or 'herdr update'

If a tool cannot update because the current session is running inside it (Herdr does this), do not
work around it. Report the exact command for me to run after I exit.

=== 5b. INSTALL THE ego lite BROWSER (macOS only) ===

ego lite is the browser both I and the agent drive. There is no Homebrew formula; it is a DMG.

 1. Skip this whole step on non-macOS and say so. Do not improvise a Linux/Windows install.
 2. If /Applications/'ego lite.app' or ~/Applications/'ego lite.app' already exists, do not
    reinstall — log UNCHANGED and go to 5b.5.
 3. Otherwise run the skill's own installer, which downloads the arch-correct DMG, installs the app,
    clears the quarantine attribute, and opens it:
      sh ~/.agents/skills/ego-browser/scripts/install.sh
    (read ego-browser/references/install.md before running it)
 4. STOP AND WAIT. First-run onboarding is a GUI step only I can complete: it asks whether to import
    Chrome data and it is what registers the 'ego-browser' command under ~/.local/bin. Do not click
    through it, do not answer the Chrome-migration question for me, and do not report this step as
    done before I confirm. If I am not present, mark it PENDING-USER and continue with the rest.
 5. Verify, without launching any browsing task:
      command -v ego-browser            (if missing: export PATH="$HOME/.local/bin:$PATH" and retry)
      ego-browser nodejs <<'EOF'
      cliLog('ego-browser ready')
      EOF
    Printing 'ego-browser ready' is the only acceptable proof. An app that exists is not proof.
 6. Do not open any site, log into anything, or run any task in my session while verifying.

=== 6. MCP INTEGRATION ===

For any tool registering an MCP server:

 0. Make Codebase Memory MCP the default code-intelligence server in every detected agent harness.
    If code-review-graph is also registered, remove only its MCP config entry after backing up the
    config file. Do not uninstall its binary or delete its indexes unless I explicitly ask.
 1. Set 'command' to the ABSOLUTE PATH OF THE BINARY YOU ACTUALLY INSTALLED. Installers routinely
    guess the wrong runner (writing 'uvx' for a pipx install), which makes the client download the
    package on every cold start and time out during handshake. This presents as "loading forever",
    not as an error.
 2. Remove any 'cwd' the installer hardcoded. A global config must not pin to whatever directory
    setup happened to run in.
 3. VALIDATE WITH A REAL HANDSHAKE BEFORE DECLARING SUCCESS: drive the server over stdio with
    initialize -> notifications/initialized -> tools/list, and report the measured time and tool
    count. A server that starts is not the same as a server that answers.
 4. If the tool supports a multi-repo registry, register each built graph so the tools work from a
    parent directory as well as from inside each repo.

=== 7. GLOBAL INSTRUCTION FILES ===

Replace every detected agent's global instruction file with the following content, from
"# Operating Instructions" through the end of the "6. Report" paragraph:

# Operating Instructions

**Stance** — Smallest maintainable change; no unrelated refactoring. Prefer reversible choices; ask only on consequential ones (data loss, public API, security, migration), else state the assumption and continue. Never assert what you haven't verified.

**1. Orient** — Read repo instructions, tests, and the closest analogous code. Structural questions: maps and entry points before internals. Open \`ask-matt\` to pick the right skill before starting. Batch independent reads.

**2. Plan** — Goal · files to touch · exact verification commands · assumptions taken instead of asking.

**3. Adversarial review (gate, after every plan)** — Answer: wrong problem? already exists (cite path)? each assumption \`verified: <evidence>\` or \`unchecked\`? blast radius and rollback? simpler alternative? what failure passes all planned checks?
Passes only on a concrete objection + revision, or an explicit statement that it survived and the strongest counter-argument. "Looks good" is not a review. Multi-file / migration / security / perf: hand the review to a fresh-context subagent given only the plan and code paths, not your reasoning. Resolve or accept every \`unchecked\` before executing.

**4. Execute** — Follow the reviewed plan; if reality contradicts it, stop and re-run the gate. Delegate independent work to fresh-context subagents. Pass briefs and results through files, never large dumps into main context.

**5. Verify** — Run tests/types/build/repro; paste the command and real output. If impossible here, say so and state what a human must run. "Should work" is a failure to verify.

**6. Report** — Conclusion first (1–3 sentences: what changed, verified or not, next action), then details: reasoning, file paths with lines, commands and output, caveats, what you did not check. Cite definition sites, not comments. Use a real input → output example when it beats prose. Silence about a gap reads as a claim there is none.

Targets: global CLAUDE.md, AGENTS.md, GEMINI.md, OpenCode instructions, Kiro steering.
Preserve only a timestamped backup of the previous content.

Prefer ONE canonical file (~/.agents/AGENTS.md) with each agent's path symlinked to it, so a single
write propagates everywhere. After writing, verify by comparing checksums across all target paths —
they must be identical, and the count must equal the number of detected agents.

Sweep for STALE SIBLING INSTRUCTION FILES the previous configuration left behind (for example an
extra file in Kiro's steering directory). One of them silently re-injects the old rules alongside
the new ones. Back up, then remove.

If an agent has no documented global instruction file, skip it and say so. Do not invent a config path.

=== 8. LINKING ===

Link each canonical skill into ~/.agents/skills from its source repository. Preserve every complete
skill directory — SKILL.md, scripts, hooks, references, templates, schemas, galleries, assets.

For each target, branch on the current state and log which branch ran:

  symlink -> correct source   leave alone            log UNCHANGED
  symlink -> different target retarget               log REPAIRED
  real directory              mv to backup, then link log REPLACED
  empty directory             rmdir, then link       log REPAIRED
  absent                      link                   log INSTALLED

Never create duplicate repositories, nested copies, or alternate names such as skill-2 or
skill.bak-<date>. If prior runs left such duplicates, ARCHIVE them to
~/.agents/skills-bak/<timestamp>/ — do not delete, and do not leave them in place where they load
as separate skills and bloat every agent's context.

Then link each agent's global skills directory to ~/.agents/skills:
  macOS/Linux: directory symlink (ln -s handles both files and directories).
  Windows, a FILE:      New-Item -ItemType SymbolicLink; if denied, fall back to HardLink (same drive).
  Windows, a DIRECTORY: New-Item -ItemType SymbolicLink; if denied, fall back to Junction.
                        NEVER hardlink a directory — mklink /H does not work on folders.
  Copying is a documented last resort only. A 350 MB copy that drifts from canonical is worse than
  no installation.
  Never replace an unrelated user-owned directory, and never create a link that resolves inside
  itself. Before linking X -> Y, confirm Y does not resolve under X.

=== 9. VERIFICATION ===

Produce a SEPARATE, READ-ONLY audit script (~/.agents/work/audit-skills.sh) that mutates nothing and
classifies every entry: symlink-with-SKILL.md, realdir-with-SKILL.md, broken link, empty directory,
missing SKILL.md. Run it and report the counts.
EMPTY DIRECTORIES AND BROKEN LINKS MUST BOTH BE ZERO.

Also verify:
  - The canonical ask-matt SKILL.md does not contain 'disable-model-invocation: true', and every
    installed ask-matt link resolves to that same file.
  - Every CLI responds to --version / --help.
  - Every MCP server passes the handshake probe from step 6.3.
  - Instruction-file checksums are identical across all agent paths.
  - No autonomous loop was started, no Context Diet restriction was activated, no paid service was
    authenticated, and no credits were spent.
  - gpt-image-2 is configured but not wired to trigger on anything except an explicit request.
  - ego-browser resolves on PATH and answers the heredoc probe from 5b.5 — or is reported as
    PENDING-USER because GUI onboarding is unfinished. No site was visited, no login was performed,
    and no Chrome data was migrated on my behalf. No Playwright/Puppeteer/Chromium download ran.
  - No git repository outside ~/.agents has new modified or untracked files attributable to this
    run. Check git status in each repo you entered.

Rerun the ENTIRE setup to confirm idempotency: the second run must report UNCHANGED for every item
and produce no new backup entries.

=== 10. LEAVE A REPAIR PATH ===

Empty-directory damage is caused by OTHER tools after setup finishes, so the environment needs a
repair path that outlives this run. Leave behind:
  - audit-skills.sh  read-only, safe to run any time
  - link-skills.sh   idempotent repair, safe to re-run
  - a note in ~/.agents/docs/: if an agent reports a skill as missing, run the audit first; if it
    shows empty directories, run the linker.

=== 11. REPORT ===

Report every item as installed / updated / unchanged / repaired / skipped / failed, with the backup
directory and the exact rollback command. State plainly what was verified and by what evidence, what
was skipped and why, and what remains for me to run manually. Do not describe an unverified step as
done. Do not commit or push anything.`;
