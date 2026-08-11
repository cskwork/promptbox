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
  { category: 'skills', slug: 'writing-for-agents' },
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

Identify installed agents: Claude Code, Codex, Jcode, Pi, Kiro, Antigravity/agy, Gemini CLI, OpenCode, Cursor.
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
                                      INSTALL EVERY SKILL IN THIS REPO — do not hand-pick. After the
                                      clone/pull, enumerate every directory containing a SKILL.md under
                                      skills/ (today: skills/engineering, skills/misc, skills/productivity
                                      and skills/in-progress — 35 skills) and link all of them, including
                                      the in-progress ones and any category added later. Do not hardcode
                                      a skill list: upstream adds skills continuously, and a link set
                                      created by an earlier run goes stale without any broken link or
                                      empty directory to reveal it (wait-what and writing-for-agents
                                      landed this way and were simply absent). On every rerun, diff the
                                      enumerated upstream set against the existing links and install the
                                      difference — an install that is merely intact is not up to date.
  Context Diet                        https://github.com/cskwork/context-diet-skill
  Autoresearch                        https://github.com/uditgoenka/autoresearch
  Call Agent                          https://github.com/cskwork/call-agent
  Archify                             https://github.com/tt-a1i/archify
  Hallmark                            https://github.com/Nutlope/hallmark
  GPT Image 2                         https://github.com/agentspace-so/agent-skills/tree/main/gpt-image-2
  Clean Code                          https://github.com/cskwork/clean-code
  Debug Code                          https://github.com/cskwork/promptbox
                                      Clone the promptbox repo, then link src/content/skills/debug-code
                                      as a skill directory. The skill ships its SKILL.md and two reference
                                      files embedded in the promptbox .md body; materialise them into
                                      ~/.agents/skills/debug-code/ with the SKILL.md frontmatter
                                      (name: debug-code) and a references/ subfolder. Take the reference
                                      FILENAMES from the links inside SKILL.md, not from this prompt —
                                      they are currently production-probes.md and production-bug-patterns.md,
                                      and inventing names here silently breaks every link in the skill.
  Skill Curator                       https://github.com/cskwork/skill-curator
                                      Inventories, validates, deduplicates, archives, and restores the
                                      skill library this prompt builds — the maintenance counterpart to
                                      the step 9 audit. Clone the repo and link skills/skill-curator like
                                      any other skill. Do NOT use its install.sh for a hub install: it
                                      COPIES the package instead of linking, so the hub stops being the
                                      single source, and when a copy already exists it renames it to
                                      skill-curator.bak.<timestamp> INSIDE the skills root — a dated
                                      directory carrying a valid SKILL.md, which every harness then loads
                                      as a second, near-identical skill. That is exactly the duplicate
                                      family step 8 archives.
                                      Its frontmatter sets 'disable-model-invocation: true' BY DESIGN: it
                                      mutates a skill library and must stay user-invoked. Leave that flag
                                      alone — the normalization above applies to ask-matt only.
                                      Requires python3 3.9+. Verify with the engine, not the directory:
                                        python3 ~/.agents/skills/skill-curator/scripts/curator.py --help
  OfficeCLI                           https://github.com/iOfficeAI/OfficeCLI
  Herdr                               https://github.com/ogulcancelik/herdr
  ego-browser (browser QA + web automation)  https://github.com/citrolabs/ego-lite
    macOS ONLY. This is the browser layer for this kit — see step 5b for the app install.
    On non-macOS, skip both the app and the ego-browser skill and report SKIPPED-UNSUPPORTED.
    Skill-only route (macOS only): npx skills add citrolabs/ego-lite
    Installing the ego lite app also registers the skill into every agent skills directory, so run
    step 5b FIRST and then reconcile: if <skills-dir>/ego-browser already exists and points at
    ~/.local/share/ego/ego-skills, treat it as INSTALLED and do not clone a second copy.
    On non-macOS, Playwright MAY be installed as the browser-automation fallback when needed. It is
    separate from ego lite and must be reported by its own name. If Playwright or SuperQA already
    exists, inspect and reuse or update it rather than marking it SUPERSEDED or suggesting uninstall.

Derive each skill's canonical name from its SKILL.md frontmatter 'name:' field, not from the
directory name, and fail loudly on a collision instead of silently overwriting. Two directories with
different names can still declare the same 'name:' (a hand-installed standalone copy alongside the
one this prompt materialises). Only one of them will ever load, and which one is arbitrary. Report
both with their paths, keep the copy this prompt installs, and ARCHIVE the other to
~/.agents/skills-bak/<timestamp>/ — archive, never delete.

AFTER EVERY CLONE OR PULL, RE-VERIFY THE LINK — DO NOT ASSUME AN UPDATE IS SAFE. Upstream
repositories relocate SKILL.md as they adopt the standard skills/<name>/ layout. When that happens
the symlink still resolves, the directory still exists, and \`ls\` looks perfectly healthy — but
SKILL.md is gone and the skill has silently disappeared from every agent. This is the same
"directory is not evidence" failure as an interrupted installer, except a successful \`git pull\`
causes it. For each linked skill, after updating its source, confirm <link>/SKILL.md is readable and
non-empty; if it is not, search the source repo (skills/<name>/, then any SKILL.md within a few
levels, excluding .git) and retarget the link to the directory that actually holds it.

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

  OfficeCLI           brew install officecli
  Herdr               official installer, or 'herdr update'
  rtk                 https://github.com/rtk-ai/rtk — CLI proxy that compresses shell command
                      output (git, pytest, docker, kubectl, cargo, eslint, 100+ commands) before it
                      reaches the model's context.
                        macOS/Linux:  brew install rtk
                                      or  curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
                        Windows:      download the x86_64-msvc release binary, or cargo install --git https://github.com/rtk-ai/rtk
                      Do NOT 'cargo install rtk' from crates.io — an unrelated crate owns that name.
                      Ensure ripgrep is on PATH; some rtk filters shell out to it.
                      Wire it into every detected agent with:  rtk init -g
                      This writes hooks (Claude Code PreToolUse, Gemini CLI BeforeTool, OpenCode/Pi
                      plugins, Windsurf/Cline rules), NOT an MCP server. Treat those hook files like
                      any other agent config: back up before it writes, and if 'rtk init -g' would
                      overwrite an existing hook you did not create, back that hook up first and
                      report the diff.
                      IT ALSO EDITS THE GLOBAL INSTRUCTION FILE. 'rtk init -g' writes ~/.claude/RTK.md
                      and appends an '@RTK.md' line to ~/.claude/CLAUDE.md. Under step 7 that path is
                      a symlink to the single canonical ~/.agents/AGENTS.md, so this one line lands in
                      the file EVERY agent reads — and Jcode, Pi, Gemini, OpenCode, and Kiro have no
                      RTK.md next to their instruction file, so they each start every session with a
                      dangling include. Therefore: run this step BEFORE step 7, and after it re-verify
                      that the canonical file still contains exactly the step 7 content. If '@RTK.md'
                      (or any other agent-specific include) was appended, back the file up and remove
                      that line — the PreToolUse hook in settings.json is what makes rtk work; the
                      instruction-file include is not required for it.
                      Verify:  rtk --version   and   rtk gain
                      Restart each agent afterwards, or the hook is not loaded.

If a tool cannot update because the current session is running inside it (Herdr does this), do not
work around it. Report the exact command for me to run after I exit.

=== 5b. INSTALL THE ego lite BROWSER (macOS only) ===

ego lite is the browser both I and the agent drive. There is no Homebrew formula; it is a DMG.

 1. Skip this ego lite step on non-macOS and say so. On Windows and Linux, record only ego lite and
    its skill as SKIPPED-UNSUPPORTED. Do not improvise an ego lite install. Playwright may be installed
    separately as the browser-automation fallback when needed.
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

 1. Set 'command' to the ABSOLUTE PATH OF THE BINARY YOU ACTUALLY INSTALLED. Installers routinely
    guess the wrong runner (writing 'uvx' for a pipx install), which makes the client download the
    package on every cold start and time out during handshake. This presents as "loading forever",
    not as an error.
 2. Remove any 'cwd' the installer hardcoded. A global config must not pin to whatever directory
    setup happened to run in.
 3. VALIDATE WITH A REAL HANDSHAKE BEFORE DECLARING SUCCESS: drive the server over stdio with
    initialize -> notifications/initialized -> tools/list, and report the measured time and tool
    count. A server that starts is not the same as a server that answers.

=== 6b. CODEBASE-INDEXER MCP SERVERS — FIND, THEN ASK BEFORE REMOVING ===

This kit's token strategy is rtk (compress shell output on the way in). Codebase-indexer MCP
servers pull the opposite way: they keep a large tool schema resident in every context window and
return long index payloads. Running both is redundant, so this step retires the indexers — but
REMOVAL IS NOT AUTOMATIC.

 1. Scan every detected agent's MCP config for codebase-indexing / code-graph / semantic-code-search
    servers. Match on purpose, not just on name. Known examples: codebase-memory-mcp, serena,
    claude-context, code-index-mcp, codegraph, sourcegraph/cody MCP, repomix-style whole-repo
    indexers. If a server's description says it indexes, embeds, or graphs a repository for search,
    it belongs on the list.
    A NAME IS NOT A REGISTRATION. Grepping for these names hits things that are not servers, and
    "removing" them breaks unrelated configuration. Before listing an entry, confirm it is a live
    registration under an mcpServers / mcp / [mcp_servers.*] key. Specifically exclude: strings in a
    permissions.deny or allow list (e.g. "mcp__serena" in ~/.claude/settings.json is context-diet
    BLOCKING that server, not enabling it — deleting the line re-enables what the user chose to turn
    off), commented-out config blocks, and entries already marked disabled/enabled:false. Also note
    that MCP servers can be registered per-project rather than globally (~/.claude.json stores them
    under projects.<path>.mcpServers); report the project path so I can tell global from local.
 2. Report the list: server name, which agent config file, and the exact lines. Also report any
    SessionStart hook or instruction-file paragraph that tells agents to prefer those tools
    (e.g. a "Code Discovery Protocol" block) — leaving that behind after removing the server makes
    every session start with instructions for tools that no longer exist.
 3. STOP AND ASK ME. Do not remove, disable, comment out, or rename anything until I say yes.
    Ask once, listing everything, and let me approve all / some / none. If I am not present or do
    not answer, change nothing and mark each entry PENDING-USER-CONSENT.
 4. Only for the entries I approve: back up each config file into the timestamped backup directory
    FIRST, then remove just those server entries and the hook/instruction text that references them.
    Leave every other server untouched. Do not delete the tool's own cache, index database, or
    installed binary unless I explicitly ask — removing the registration is enough and is
    reversible.
 5. Report the exact rollback command (restore file from ~/.agents/setup-backups/<timestamp>/), and
    verify each edited config still parses as valid JSON/TOML before finishing.

=== 7. GLOBAL INSTRUCTION FILES ===

Replace every detected agent's global instruction file with the following content, from
"# Operating Instructions" through the end of the "7. Report" paragraph:

# Operating Instructions

**Stance** — Domain data first: get the domain model and real data shapes right before code or tests — tests verify the model, they never define it. Make the smallest verified, maintainable change. Make maintainable code; no unrelated refactoring. Prefer reversible choices. Ask only about consequential data loss, public API, security, or migration decisions; otherwise state assumptions and proceed. Never claim what you did not verify. Always merge worktree after done ask user if unsure target branch.

**1. Orient** — Read repo instructions, the domain model and real data shapes, then relevant tests/contracts, and the closest analogous code. Open \`ask-matt\` to select the right skill. Map entry points, callers, dependencies, side effects, and real verification commands. Batch independent reads.

**2. Delegate** — As an orchestrator use subagents for plan, review, execute, and verify tasks. As soon as the question is framed, fan out fresh-context subagents. Each gets a narrow brief: goal, candidate paths, constraints, expected output.
Skip delegation only when you already know the exact file and symbol, or the change is a single trivial edit.

**3. Plan** — State: \`task type · goal · files · contracts · verification · assumptions\`.

After stating the plan, run a \`grilling\` session (using \`domain-modeling\`, producing ADRs/glossary) to interview the user until their intent is clearly understood and confirmed. Do not start implementation before this confirmation. Skip the grilling for trivial or unambiguous changes — state assumptions and proceed.

**4. Adversarial review** — After every plan, challenge:

- does the plan match the domain logic?
- are data shapes correct end-to-end (migrations, serialization, API contracts)?
- does it fix the relevant issues and match the user request?
- is this clean code?

Pass only after a concrete objection and revision, or the strongest counterargument and why the plan survives.

**5. Execute** — Follow the reviewed plan; rerun the gate if reality differs. Prefer intuitive names, clear control flow, cohesive local code. Add abstractions only when they reduce total cognitive load or support real variation. Preserve behavior unless the requested feature or fix changes it.

Keep delegating during execution on the same terms as step 2 — independent work goes to fresh-context subagents, not to your own context. Pass large results through files and independently verify them.

**6. Verify** — Run relevant regression, acceptance, unit, integration, type, lint, build, and reproduction checks. Show commands and real output. Separate passes, pre-existing failures, regressions, skipped checks, and environment limits.

**7. Report** — Start with a plain-language summary anyone can understand: what changed, whether it works now or remains unverified, and whether the user needs to do anything next. Keep file paths, commands, and unexplained jargon out of this opening. Then list changed files/lines, behavior or compatibility impact, commands/results, assumptions, caveats, delegated work reviewed, and unverified areas. Prefer input → output examples when clearer.

Targets include Claude \`~/.claude/CLAUDE.md\`, Codex \`~/.codex/AGENTS.md\`, Jcode \`~/AGENTS.md\`,
Pi \`~/.pi/agent/AGENTS.md\`, Gemini \`~/.gemini/GEMINI.md\`, OpenCode instructions, and Kiro steering.
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

Never create duplicate repositories, nested copies, or alternate names such as skill-2,
skill.bak-<date>, or skill.backup-<YYYYMMDD-HHMMSS>. If prior runs left such duplicates, ARCHIVE
them to ~/.agents/skills-bak/<timestamp>/ — do not delete, and do not leave them in place where they
load as separate skills and bloat every agent's context. Match the whole family of suffixes, not the
two examples above: a dated backup directory still carries a valid SKILL.md, so the harness happily
loads four near-identical copies of the same skill and none of them looks broken.

Only create a per-agent skills-directory adapter when the installed harness requires one. Current Jcode
and Pi versions load \`~/.agents/skills\` natively. For them, verify that behavior and preserve existing
\`~/.jcode/skills\`, \`~/.pi/skills\`, and \`~/.pi/agent/skills\` directories in place; they may contain
user-owned or tool-managed skills that are not in the canonical hub.

For agents that require an adapter, link the documented global skills directory to ~/.agents/skills:
  macOS/Linux: directory symlink (ln -s handles both files and directories).
  Windows, a FILE:      New-Item -ItemType SymbolicLink; if denied, fall back to HardLink (same drive).
  Windows, a DIRECTORY: New-Item -ItemType SymbolicLink; if denied, fall back to Junction.
                        NEVER hardlink a directory — mklink /H does not work on folders.
  Copying is a documented last resort only. A 350 MB copy that drifts from canonical is worse than
  no installation.
  Never replace an unrelated user-owned directory, and never create a link that resolves inside
  itself. Before linking X -> Y, confirm Y does not resolve under X.

If an adapter path is ALREADY a real directory holding a full copy of the hub (a previous run that
fell back to copying), converting it to a link is a repair, not a rewrite — but prove it is safe
first. List the entries present in the copy but absent from the hub. If anything survives that is
not an archive leftover, STOP and report it: those are skills that exist only there and linking
would hide them. If the only extras are duplicates you are archiving anyway, move the whole copy
into the timestamped backup directory (mv, never rm -rf), create the link, then confirm SKILL.md is
readable through the new link for a few known skills before calling it repaired.

=== 9. VERIFICATION ===

Produce a SEPARATE, READ-ONLY audit script (~/.agents/work/audit-skills.sh) that mutates nothing and
classifies every entry: symlink-with-SKILL.md, realdir-with-SKILL.md, broken link, empty directory,
missing SKILL.md. Run it and report the counts. Have it also list any two entries whose SKILL.md
declares the same frontmatter 'name:'.
EMPTY DIRECTORIES AND BROKEN LINKS MUST BOTH BE ZERO.

Gate the exit status on those two counts only. A skills directory legitimately contains folders that
are not skills — user notes, a tool-managed bundle — and they have no SKILL.md by design. If they
count as damage, every run ends in DAMAGE FOUND, and after the second or third time nobody reads the
result, which is how real breakage gets missed. Report missing-SKILL.md as a WARN list for a human
to read, and never auto-delete those directories.

If you write the audit in zsh or bash, declare counters with \`local -i n=0\`. A plain \`local n=0\`
followed by \`n+=1\` performs STRING CONCATENATION, so the script reports counts like
"1111111111111111111" or a garbage negative number while every other line looks correct — a
verification script that lies is worse than none.

Also verify:
  - The canonical ask-matt SKILL.md does not contain 'disable-model-invocation: true', and every
    installed ask-matt link resolves to that same file.
  - Every directory holding a SKILL.md under the Matt Pocock source (all categories, in-progress
    included) has a corresponding link in ~/.agents/skills. Report the upstream count, the linked
    count, and any name present upstream but missing locally. These two numbers must be equal; a
    smaller local count is a stale install, not a healthy one.
  - Every CLI responds to --version / --help.
  - Every MCP server passes the handshake probe from step 6.3.
  - Instruction-file checksums are identical across all documented agent paths, including Jcode's
    \`~/AGENTS.md\` and Pi's \`~/.pi/agent/AGENTS.md\`.
  - No autonomous loop was started, no Context Diet restriction was activated, no paid service was
    authenticated, and no credits were spent.
  - gpt-image-2 is configured but not wired to trigger on anything except an explicit request.
  - On macOS, ego-browser resolves on PATH and answers the heredoc probe from 5b.5, or is reported as
    PENDING-USER because GUI onboarding is unfinished. On non-macOS, ego lite is reported as
    SKIPPED-UNSUPPORTED; Playwright is allowed as a separate fallback and, if installed, its package
    and browser versions are reported. No site was visited, no login was performed, and no Chrome
    data was migrated on my behalf.
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
