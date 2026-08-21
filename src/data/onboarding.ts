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
  // start here — pick ONE workflow set; its router routes everything else.
  // agent-skills is the default; the other two are the alternatives the install
  // prompt offers in section 4a. Never install more than one — the routers collide.
  { category: 'plugins', slug: 'agent-skills' },
  { category: 'plugins', slug: 'superpowers' },
  { category: 'skills', slug: 'ask-matt' },
  { category: 'skills', slug: 'setup-matt-pocock-skills' },
  // set-independent: one keystroke that makes the agent re-explain itself
  { category: 'skills', slug: 'wait-what' },
  // one shared memory every agent reads and writes
  { category: 'tools', slug: 'ai-memory' },
  // orient + plan
  { category: 'skills', slug: 'grill-with-docs' },
  { category: 'skills', slug: 'improve-codebase-architecture' },
  { category: 'skills', slug: 'triage' },
  { category: 'skills', slug: 'handoff' },
  // build + verify
  { category: 'skills', slug: 'tdd' },
  { category: 'skills', slug: 'prototype' },
  { category: 'skills', slug: 'diagnose' },
  { category: 'skills', slug: 'verify' },
  { category: 'mcps', slug: 'codebase-memory-mcp' },
  // super* end-to-end suite
  { category: 'skills', slug: 'supergoal' },
  { category: 'skills', slug: 'superpm' },
  { category: 'skills', slug: 'superdesign' },
  { category: 'skills', slug: 'superoffice' },
  { category: 'skills', slug: 'superhacker' },
  { category: 'tools', slug: 'ego-lite' },
  // answer the agent from your own past decisions
  { category: 'skills', slug: 'prompter' },
  // build your own
  { category: 'skills', slug: 'writing-for-agents' },
  // design + docs + media
  { category: 'skills', slug: 'canvas-ui-design' },
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

Identify installed agents: Claude Code, Codex, Jcode, Pi, Hermes, Kiro, Antigravity/agy, Gemini CLI, OpenCode, Cursor.
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

=== 4a. WORKFLOW SET — ASK ME, THEN INSTALL EXACTLY ONE ===

A workflow set is the meta-skill layer that decides HOW the agent works: which phase it is in, which
skill to load, and when to stop for me. Three sets solve that same problem in incompatible ways, so
INSTALLING TWO IS A BUG, NOT A BONUS. Their routers (using-agent-skills, using-superpowers, ask-matt)
each claim the same incoming task and send it down a different pipeline; whichever loads first wins,
arbitrarily, and the other set's rules leak into it.

BEFORE INSTALLING ANY SKILL, SHOW ME THIS TABLE AND ASK WHICH SET I WANT. Present the default, wait
for my answer, and do not start step 4 until I answer. If I do not answer, or you are running
non-interactively, install A (Agent Skills) and say so in the report.

  Aspect        | A. Agent Skills (DEFAULT)      | B. Superpowers               | C. Matt Pocock Skills
  --------------|--------------------------------|------------------------------|--------------------------
  Source        | addyosmani/agent-skills        | obra/superpowers             | mattpocock/skills
  Philosophy    | encode the whole lifecycle,    | reason deeply up front, then | requirements first; refuses
                | human checkpoint each phase    | hands-off autonomous run     | to own your process
  Size          | 24 skills over 6 phases        | 6 pipeline stages            | many small modular skills
  Invocation    | 8 slash commands               | pipeline activates itself    | user-invoked and
                | /spec /plan /build /test       |                              | model-invoked kept separate
                | /review /code-simplify         |                              |
                | /webperf /ship                 |                              |
  Execution     | stop at each phase for me      | fresh subagent per task      | one agent, light guidance
                | (/build auto runs a whole      | in an isolated git worktree  |
                | approved plan on its own)      |                              |
  Signature     | 4 review personas fan out in   | 2-5 minute task granularity  | grilling: one question at a
                | parallel at ship; CI evals     | with exact file paths; code  | time, dependency-aware
                | that test the skills; explicit | review between every task    | requirements interrogation
                | rebuttals to rationalizations  |                              |
  Strongest     | breadth — security, perf,      | ambiguous exploratory work;  | when the bottleneck is an
                | observability, CI/CD,          | approve once and walk away;  | unclear spec; easy to read
                | deprecation; team vocabulary   | cherry-pick the pieces       | and rewrite yourself
  Weakest       | opinionated and interlinked;   | heavy overhead on small,     | thinner coverage on long
                | extending it risks routing     | well-defined tasks           | lifecycles; needs you in
                | conflicts; least composable    |                              | the loop more often
  Pick it when  | production features that go    | big task, fuzzy architecture,| you know roughly what to
                | through security review to     | you want to delegate and     | build but not exactly what
                | deploy; team standardization   | stop supervising             | it should do
  --------------|--------------------------------|------------------------------|--------------------------
  None of them fits a small, well-defined task — the process overhead outweighs the benefit.
  No published benchmark compares any of the three against plain prompting, so treat the choice as a
  preference about how much control you want, not as a measured performance claim.
  Comparison source: https://dev.to/jamilxt/superpowers-vs-agent-skills-vs-pocock-three-philosophies-of-ai-coding-workflows-e6n

RECORD MY ANSWER as WORKFLOW_SET=A|B|C in ~/.agents/install-manifest.json and in the step 11 report.
Every later step that says "the chosen set" reads that value.

IF A SET IS ALREADY INSTALLED AND I CHOOSE A DIFFERENT ONE, SWITCH — DO NOT STACK. Move the old set's
links out of ~/.agents/skills into ~/.agents/disabled-skills/<set>-<timestamp>/ (mv, never delete),
leave its source clone in place so the choice stays reversible, and add each moved skill name to
~/.agents/skills-excluded if that file exists. THAT LAST STEP IS THE ONE THAT MATTERS: a relink pass
walks the source tree and re-links every SKILL.md it finds, so a set that was only unlinked comes
back on the next run with no broken link or empty directory to reveal it.

=== 4. INSTALL SKILLS ===

Install the workflow set I chose in 4a, then every set-independent skill below it.

Clone or update once into ~/.agents/sources/<owner>/<repo>. Prefer each repository's official Agent
Skills installer ONLY IF it is non-interactive and non-destructive; otherwise clone and link yourself.

  --- THE WORKFLOW SET (install ONLY the one chosen in 4a) ---

  A. Agent Skills (DEFAULT)           https://github.com/addyosmani/agent-skills
                                      24 skills under skills/<name>/SKILL.md, all of them, no
                                      hand-picking. Router is using-agent-skills; the lifecycle is
                                      DEFINE -> PLAN -> BUILD -> VERIFY -> REVIEW -> SHIP.
                                      Clone to ~/.agents/sources/addyosmani-agent-skills and link each
                                      skills/<name>/ directory into ~/.agents/skills/<name>, so Codex and
                                      OpenCode pick them up through the hub with no second install.
                                      THREE CLAUDE-CODE-ONLY ASSETS DO NOT LIVE IN THE HUB, so link them
                                      separately or they are simply missing:
                                        - the 8 slash commands from .claude/commands/*.md into
                                          ~/.claude/commands/agent-skills/ — the SUBDIRECTORY NAME BECOMES
                                          THE COMMAND PREFIX (/agent-skills:build), which is what keeps
                                          /build from colliding with a command you already own
                                        - the 4 review personas from agents/*.md into ~/.claude/agents/
                                        - hooks/ stays OPT-IN: do not register its SessionStart hook
                                          unless I ask, and never on top of an existing session banner
                                      For Codex and OpenCode, the slash commands have no equivalent. If I
                                      want them, generate adapted copies (Codex: ~/.codex/prompts/,
                                      OpenCode: ~/.config/opencode/command/) with the 'agent-skills:'
                                      plugin prefix STRIPPED from the skill names in the body — copied
                                      verbatim, the prefixed name resolves to nothing on those agents.
                                      Do NOT use per-skill installs (npx skills add … --skill <name>):
                                      they copy skills/<name>/ without the repo-root references/
                                      directory, so the skill loads but its checklist links dangle.
                                      If the marketplace route is used instead, note it clones over SSH
                                      and fails with 'Permission denied (publickey)' without GitHub SSH
                                      keys; force HTTPS rather than generating keys unattended.

  B. Superpowers                      https://github.com/obra/superpowers
                                      Pipeline set: brainstorming -> git worktrees -> writing-plans ->
                                      subagent-driven-development -> TDD -> code review -> finish.
                                      Install only if I chose B in 4a.

  C. Matt Pocock Skills, incl. ask-matt  https://github.com/mattpocock/skills
                                      Install only if I chose C in 4a.
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

  --- SET-INDEPENDENT SKILLS (install these whichever set was chosen) ---

  wait-what                           https://github.com/mattpocock/skills
                                      INSTALL THIS ONE FOR EVERY SET, INCLUDING A AND B. It lives in the
                                      Matt Pocock repo but it is not part of that workflow set: it is a
                                      six-line skill I type when a reply did not land, and it asks the
                                      agent to re-pitch with context, in Simplified Technical English,
                                      using the ubiquitous language from CONTEXT.md. It owns no
                                      pipeline and declares no router, so it cannot conflict with the
                                      chosen set.
                                      Clone the repo (shallow is enough) and link ONLY
                                      skills/productivity/wait-what as ~/.agents/skills/wait-what. Do not
                                      enumerate the rest of that repo unless set C was chosen.
                                      LEAVE 'disable-model-invocation: true' ALONE. It is deliberate —
                                      the skill exists for me to invoke at the moment I am confused, and
                                      a model that can invoke it will re-pitch on its own initiative. The
                                      router normalization further down applies to the chosen set's
                                      router only, never to this skill.
                                      IF SET C WAS CHOSEN, the full-repo enumeration already links this
                                      skill. Do not link it twice: two directories declaring
                                      'name: wait-what' means only one loads and which one is arbitrary,
                                      which is the duplicate family step 8 archives.
  Context Diet                        https://github.com/cskwork/context-diet-skill
  Autoresearch                        https://github.com/uditgoenka/autoresearch
  Call Agent                          https://github.com/cskwork/call-agent
  Archify                             https://github.com/tt-a1i/archify
  Impeccable (design default)         https://github.com/pbakaus/impeccable
                                      THE DEFAULT DESIGN SKILL for every frontend/UI task —
                                      replaces any earlier design skill in this kit.
                                      Use its official installer at GLOBAL scope with explicit
                                      providers so it never prompts:
                                        npx -y impeccable install --scope=global --providers=<detected>
                                      Run it from the home directory, never inside a repo, or it
                                      writes project-local files. This skill is NOT hub-symlinked:
                                      its installer owns the layout and writes per-agent copies
                                      plus detector hooks straight into each agent config — treat
                                      those writes like any other agent config (back up before,
                                      diff after). Update later with:  npx impeccable update
                                      (Codex must then reopen /hooks and re-approve the hook).
  GPT Image 2                         https://github.com/agentspace-so/agent-skills/tree/main/gpt-image-2
  Clean Code                          https://github.com/cskwork/clean-code
  Prompter                            https://github.com/cskwork/prompter
                                      SKILL.md sits at the repo ROOT, so link the repo directory itself
                                      as ~/.agents/skills/prompter. Learns your reply patterns locally
                                      and gates every proposal behind an explicit y/yes.
  Canvas UI Design                    https://github.com/cskwork/canvas-ui-skill
                                      SKILL.md at the repo ROOT; link as ~/.agents/skills/canvas-ui-design
                                      (the directory name must match the skill's name:, which is
                                      canvas-ui-design, not the repo name).
  Verify                              https://github.com/cskwork/verify-skill
                                      Clone and link as ~/.agents/skills/verify. SKILL.md sits at the
                                      repo ROOT, not under a skills/ subdirectory, so link the repo
                                      directory itself. After linking, run scripts/selftest.sh — it
                                      stands up a throwaway server and checks the harness in about 20
                                      seconds; 22/22 means the install works. Needs curl and jq.
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

THE CHOSEN SET'S ROUTER MUST BE MODEL-INVOKABLE, or the global rules in step 7 point at a skill the
agent never loads. The router is using-agent-skills for set A, using-superpowers for set B, ask-matt
for set C. For set C only, upstream ships ask-matt as user-invoked, so after every clone/update
resolve the canonical ask-matt SKILL.md through its installed link and flip that one flag:
  - Back up the file before the first change.
  - If frontmatter says 'disable-model-invocation: true', change only that value to false.
  - If it is already false or the field is absent, leave it unchanged.
  - Do not change this flag for any other skill.
Treat this normalization as part of installation and repair, so reruns cannot restore the upstream
user-invoked default and silently hide ask-matt from an agent's available-skills catalog.
Sets A and B ship their routers model-invokable already — verify the frontmatter, change nothing.

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

=== 5c. INSTALL ai-memory (ONE SHARED MEMORY FOR EVERY AGENT) ===

ai-memory (https://github.com/akitaonrails/ai-memory) is part of the default kit: one local server
that every installed agent reads and writes, so what Claude Code worked out, Codex already knows.
Install it NATIVE. Do NOT install Docker, Ollama, LM Studio, vLLM, an embedding model, or any local
LLM for it. The default retrieval path is SQLite FTS5 + entities + graph neighbours and needs none
of those.

 1. INSTALL THE BINARY. Download the release archive for the detected architecture into
    ~/Applications/ai-memory, verify the published .sha256 BEFORE extracting, extract, and symlink
    the binary onto PATH at ~/.local/bin/ai-memory. aarch64 = Apple Silicon, x86_64 = Intel.
    If ai-memory is already installed, update in place and PRESERVE the existing data dir, wiki, and
    config. Never run a destructive reset.

 2. STAGE THE HOOKS NEXT TO THE DATA DIR. install-hooks looks for a hooks/ directory beside the path
    it was invoked as, so calling it through the ~/.local/bin symlink fails with "could not locate
    hooks directory". Copy the extracted hooks/ tree to <data-dir>/hooks (macOS:
    ~/Library/Application Support/ai-memory/hooks). That path is on the probe list, so every later
    invocation works no matter which path was used.

 3. INITIALISE ONLY IF NOT ALREADY INITIALISED:   ai-memory init

 4. PICK A PORT THAT IS STILL FREE NEXT WEEK. The documented default is 127.0.0.1:49374, but 49374
    sits INSIDE the macOS ephemeral range (49152-65535), so the OS can hand it to any process that
    asks first — OpenCode's background service takes it in practice. Check with
    lsof -nP -iTCP:49374 -sTCP:LISTEN. If something holds it, do NOT kill that process: set both
    bind and server_url in <data-dir>/config.toml to a port below the ephemeral range (39374 works)
    and use that port everywhere afterwards. Bind to 127.0.0.1 only, never 0.0.0.0, and do not
    expose it to the LAN.

 5. NO EMBEDDINGS — THAT IS THE DEFAULT, NOT AN OPTIMISATION. Leave every one of these UNSET:
    AI_MEMORY_EMBEDDING_PROVIDER, AI_MEMORY_EMBEDDING_BASE_URL, AI_MEMORY_EMBEDDING_MODEL,
    AI_MEMORY_EMBEDDING_DIM, AI_MEMORY_RERANKER. Absent IS disabled; there is no "off" value to
    write. Never run 'ai-memory embed'. If an embedding setting already exists specifically for
    ai-memory, back up the config first, then remove it. Afterwards 'ai-memory status' must report
    "embedding: disabled" and the models/ directory must still be empty.

 6. TURN OFF THE BACKGROUND SCHEDULER. The generated config.toml ships [auto_improve.scheduler] with
    enabled = true, which sweeps every project through an LLM once an hour. Set it to false and
    preserve every unrelated value in that file.

 7. LEAVE ASSISTANT CAPTURE OFF. Do not set capture_assistant and do not pass --capture-assistant to
    install-hooks. Assistant turns can quote code and secrets, and they would flow straight into a
    cloud LLM prompt.

 8. AN LLM PROVIDER IS OPTIONAL. Zero-LLM is a fully working tier: FTS5 + entity + graph retrieval
    with rule-based session summaries. Only if I ask for LLM-written summaries, use my existing
    ChatGPT/Codex subscription rather than a platform API key:
      ai-memory auth login openai-oauth      device-code flow — STOP AND WAIT, only I can approve it
    then set llm_provider = "openai-oauth" and llm_model = "gpt-5-mini" in config.toml. A mini-class
    model is correct here; consolidation and lint are summarisation, not reasoning.
    ORDER MATTERS: if a provider is configured and no token is stored, the server REFUSES TO START
    with "provider not configured". Finish the login first, or leave both keys out entirely.
    Never substitute OPENAI_API_KEY for this, and never print an access or refresh token.

 9. RUN EXACTLY ONE SERVER, AND MAKE IT START ITSELF AT LOGIN. Everything above is inert while the
    server is down: the hooks still fire, they just fail, and every agent silently loses the shared
    memory. Autostart is part of the default kit — INSTALL IT WITHOUT ASKING ME. Check for an
    existing listener before starting anything (lsof -nP -iTCP:<port> -sTCP:LISTEN), and never end
    up with one process per agent, one data store per agent, or one wiki per agent.

    macOS — a LaunchAgent. It loads at LOGIN, not at boot, which is what I want: the data dir lives
    in my home. Write ~/Library/LaunchAgents/com.github.akitaonrails.ai-memory.plist:

      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
        "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
      <plist version="1.0">
      <dict>
        <key>Label</key>             <string>com.github.akitaonrails.ai-memory</string>
        <key>ProgramArguments</key>  <array>
          <string>/Users/<me>/.local/bin/ai-memory</string>
          <string>serve</string><string>--transport</string><string>http</string>
        </array>
        <key>RunAtLoad</key>         <true/>
        <key>KeepAlive</key>         <true/>
        <key>ThrottleInterval</key>  <integer>10</integer>
        <key>EnvironmentVariables</key> <dict>
          <key>HOME</key> <string>/Users/<me></string>
          <key>PATH</key> <string>/Users/<me>/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
        </dict>
        <key>StandardOutPath</key>   <string>/Users/<me>/Library/Logs/ai-memory.out.log</string>
        <key>StandardErrorPath</key> <string>/Users/<me>/Library/Logs/ai-memory.err.log</string>
      </dict>
      </plist>

    ABSOLUTE PATHS ONLY — launchd expands no ~ and reads no login shell, so a bare 'ai-memory' or a
    tilde path exits 127 on every retry, forever. OMIT --bind: config.toml already carries bind and
    server_url, and a port repeated in the plist is how the two drift apart after step 4 moves it.
    Then load it and PROVE it, because a plist on disk is not a running server:
      plutil -lint ~/Library/LaunchAgents/com.github.akitaonrails.ai-memory.plist
      launchctl bootout   gui/$(id -u)/com.github.akitaonrails.ai-memory 2>/dev/null
      launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.github.akitaonrails.ai-memory.plist
      lsof -nP -iTCP:<port> -sTCP:LISTEN      -> must show ai-memory LISTEN
      ai-memory status                        -> same bind + data-dir as config.toml
    Use bootstrap, not kickstart, as that proof: bootstrap alone runs the same RunAtLoad path login
    uses, so a listener appearing after it IS the login evidence. Read the exit-status column of
    'launchctl list | grep ai-memory' too — a non-zero value there means crash-looping, not running.

    Windows — a per-user Scheduled Task with an AtLogOn trigger, registered AS ME:
      $exe = "$env:LOCALAPPDATA\\Programs\\ai-memory\\ai-memory.exe"   # the path actually installed
      $act = New-ScheduledTaskAction -Execute $exe -Argument 'serve --transport http'
      $trg = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
      $opt = @{ AllowStartIfOnBatteries = $true; DontStopIfGoingOnBatteries = $true
                RestartCount = 3; RestartInterval = (New-TimeSpan -Minutes 1)
                ExecutionTimeLimit = (New-TimeSpan -Seconds 0) }   # 0 = never time out
      $set = New-ScheduledTaskSettingsSet @opt
      Register-ScheduledTask -TaskName ai-memory -Action $act -Trigger $trg -Settings $set -Force
      Start-ScheduledTask -TaskName ai-memory
    Verify with (Get-ScheduledTask ai-memory).State and
    Get-NetTCPConnection -LocalPort <port> -State Listen. Do NOT register it under SYSTEM or with
    -RunLevel Highest: the data dir, config, and wiki live in my profile, and a SYSTEM copy would
    quietly build a second, empty memory next to mine.

    ONE SUPERVISOR, NOT TWO. No pm2, no brew services, no login-item wrapper script, and never an
    'ai-memory serve' line in my shell profile — that starts one server per terminal window. If a
    supervisor entry for ai-memory already exists, repair it in place instead of adding a second one.
    While you are in ~/Library/LaunchAgents, also report any DEAD memory-server agent you find: a
    plist whose program no longer exists respawns every ThrottleInterval forever. Give me its label
    and the missing path, and ask before removing it.

10. WIRE EVERY DETECTED AGENT TO THAT ONE SERVER. For each agent found in step 1's detection, run
    BOTH commands, substituting the identifier:
      ai-memory install-mcp   --client <id> --apply
      ai-memory install-hooks --agent  <id> --project-strategy repo-root --apply
    Identifiers in current releases: claude-code, codex, open-code, cursor, gemini-cli,
    antigravity-cli, omp, kiro-cli, pi (hooks only), plus kimi-code, grok, devin, command-code,
    openclaw, and zero when those are installed. Do NOT invent an identifier: read
    'ai-memory install-mcp --help' and 'ai-memory install-hooks --help' first and use only what the
    installed version lists. Configure ONLY the agents actually present; do not install a new agent
    just because ai-memory supports it.
    ALWAYS pass --project-strategy repo-root. The default resolves the project from the current
    folder name, so one 'cd' into a subdirectory mid-session files the rest of that session under a
    phantom project and splits the memory. Run each command once WITHOUT --apply and read the
    rendered output before applying. --apply is idempotent, writes a timestamped backup first, and
    preserves unrelated MCP servers, hooks, permissions, models, and plugins — verify that by
    diffing against the pre-flight inventory, not by trusting the message.

11. TWO EXCEPTIONS.
    Pi has no mcp.json. 'install-mcp --client pi' deliberately prints guidance instead of writing an
    ignored file; the extension written by 'install-hooks --agent pi' carries lifecycle capture AND
    the MCP bridge. Do not hand-write ~/.pi/agent/mcp.json. Oh My Pi (omp) is a separate target with
    its own .omp paths — never conflate the two. Respect PI_CODING_AGENT_DIR when it is set.
    Hermes has no first-party installer. Do NOT run 'install-hooks --agent hermes' — that agent
    value does not exist. Merge an HTTP MCP entry into Hermes' own config instead, preferring its
    native command ('hermes mcp add ai-memory --url http://127.0.0.1:<port>/mcp'), preserve every
    existing mcp_servers entry and provider setting, and verify with 'hermes mcp list' and
    'hermes mcp test ai-memory'. Do not install the third-party ai-memory-hermes-plugin without
    asking me first.

12. RESTARTS AND TRUST PROMPTS ARE NOT OPTIONAL DETAILS. OpenCode, Pi, and Oh My Pi are wired
    through a generated TypeScript file and load it only on restart. Codex asks me to trust the new
    hooks on its next start. Report both as actions left for me rather than claiming capture is
    already live.

13. DO NOT TOUCH MY REPOSITORIES. This is a machine-level install. Do not insert ai-memory routing
    text into arbitrary AGENTS.md, CLAUDE.md, or README.md files across my projects.

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
    ai-memory IS NOT ONE OF THESE. It stores session observations, summaries, and handoffs — it
    never indexes, embeds, or graphs a repository for code search, and step 5c just installed it as
    part of the default kit. Never put it on this list, and never remove it here.
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
"# Operating Instructions" through the end of the "8. Report" paragraph.

KEEP THIS FILE LEAN. Every agent loads it on every session, so it is the most expensive text in the
setup. State the pipeline as one line of phase-to-command mapping; do not draw the ASCII box diagram
from the upstream README into it. Diagrams belong in documentation, not in a per-session prompt.

THE ROUTER NAME IN THE "Skill routing" LINE AND IN STEP 1 DEPENDS ON THE SET CHOSEN IN 4a. The text below is written for set A. For
set B write using-superpowers, for set C write ask-matt, and in step 4 swap interview-me and
documentation-and-adrs for that set's equivalents (set C: grilling and domain-modeling). A router
name that does not match the installed set is a silent failure: the agent finds no such skill, skips
orientation, and nothing in the file reveals why.

# Operating Instructions

**Stance** — Domain data first: get the domain model and real data shapes right before code or tests — tests verify the model, they never define it. Make the smallest verified, maintainable change. Make maintainable code; no unrelated refactoring. Prefer reversible choices. Ask only about consequential data loss, public API, security, or migration decisions; otherwise state assumptions and proceed. Never claim what you did not verify. Always merge worktree after done ask user if unsure target branch.

**Domain rules** — Always read \`~/.agents/rules/rules.md\` (Windows: \`%USERPROFILE%\\.agents\\rules\\rules.md\`).

**Skill routing** — \`~/.agents/skills/\` is the skill hub; \`using-agent-skills\` is the router. Place the task in one phase and drive it with that phase's command: DEFINE \`/spec\` → PLAN \`/plan\` → BUILD \`/build\` → VERIFY \`/test\` → REVIEW \`/review\` → SHIP \`/ship\`. Steps 1–8 below are how a phase is executed, not a second pipeline.

**1. Orient** — Read repo instructions, the domain model and real data shapes, then relevant tests/contracts, and the closest analogous code. Route through \`using-agent-skills\`. Map entry points, callers, dependencies, side effects, and real verification commands. Batch independent reads.

**2. Options** — Right after exploration, before any plan or code, give exactly three genuinely distinct approaches — different in strategy, not in wording. One line each: approach · main tradeoff · cost/risk. Rank them 1/2/3, mark 1 as recommended with one clause of why. Then stop and ask the user to pick. No code, no long prose. Skip only when one approach is obviously the only sane one.

**3. Delegate** — As an orchestrator use subagents for plan, review, execute, and verify tasks. As soon as the question is framed, fan out fresh-context subagents. Each gets a narrow brief: goal, candidate paths, constraints, expected output.
Skip delegation only when you already know the exact file and symbol, or the change is a single trivial edit.

**4. Plan** — State: \`task type · goal · files · contracts · verification · assumptions\`.

After stating the plan, run \`interview-me\` — one question at a time until the user's intent is clear and confirmed at ~95% confidence — and record the hard-to-reverse decisions and glossary terms with \`documentation-and-adrs\`. Do not start implementation before this confirmation. Skip the interview for trivial or unambiguous changes — state assumptions and proceed.

**5. Adversarial review** — After every plan, challenge:

- does the plan match the domain logic?
- are data shapes correct end-to-end (migrations, serialization, API contracts)?
- does it fix the relevant issues and match the user request?
- is this clean code?

Pass only after a concrete objection and revision, or the strongest counterargument and why the plan survives.

**6. Execute** — Follow the reviewed plan; rerun the gate if reality differs. Prefer intuitive names, clear control flow, cohesive local code. Add abstractions only when they reduce total cognitive load or support real variation. Preserve behavior unless the requested feature or fix changes it.

Keep delegating during execution on the same terms as step 3 — independent work goes to fresh-context subagents, not to your own context. Pass large results through files and independently verify them.

**7. Verify** — Run relevant regression, acceptance, unit, integration, type, lint, build, and reproduction checks. Show commands and real output. Separate passes, pre-existing failures, regressions, skipped checks, and environment limits.

**8. Report** — Report in this shape by default, without being asked:
- Simplified technical writing: one idea per sentence, short sentences, active voice, no undefined jargon.
- Use the project's ubiquitous language (\`CONTEXT.md\`, glossary, ADRs). Flag any term where code and glossary disagree.
- Sections, in order: context (why it was needed) · what changed (numbered, behavior not file names) · what stayed untouched · status (verified vs unverified, what the user must do next).
- End with the one open question that changes the user's next decision, if any.

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

=== 7b. DOMAIN RULES FILE ===

Create ~/.agents/rules/rules.md if absent. NEVER overwrite it — it holds rules this prompt does not
know about. On a rerun, leave existing content alone and only append what is missing. Do not delete
a rule to "clean up": a rule you cannot source is still a rule the user relies on.

Keep it to rules only — one line each, no rationale, no workflow prose. The workflow lives in the
instruction file; this file is the environment's domain and safety rules, grouped by area.

This is the seam that keeps the instruction file byte-identical across machines while the rules
differ per environment. Do not inline these rules into the instruction file.

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

PER-SKILL LINKS FOR HARNESSES WITH A POPULATED SKILLS DIRECTORY. Do not take "loads ~/.agents/skills
natively" on trust — verify it by listing a skill from the running harness. Observed reality on a real
machine: \`~/.claude/skills\`, \`~/.codex/skills\` and \`~/.config/opencode/skills\` were each a
directory symlink to \`~/.agents/skills\` (so one link covers all three), while \`~/.hermes/skills\`
held 185 real entries and \`~/.pi/skills\` held per-skill relative symlinks. Newly hubbed skills were
absent from both until linked individually.

NEVER convert a populated skills directory into a symlink to the hub. Doing so hides every skill that
harness installed for itself — 185 of them, in the case above. Link PER SKILL and leave the rest alone:

  Hermes:  ln -sfn ~/.agents/skills/<name> ~/.hermes/skills/<name>
  Pi:      ln -sfn ../../.agents/skills/<name> ~/.pi/skills/<name>    (match its existing relative style)

THE LINK NAME IS THE SKILL'S name:, NOT THE REPO NAME. \`cskwork/canvas-ui-skill\` must be linked as
\`canvas-ui-design\`. A mismatch loads nothing and reports nothing — it fails silently.

Verify each link the same way as everything else: \`<skills-dir>/<name>/SKILL.md\` readable and non-empty.

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
  - EXACTLY ONE workflow set is live. Count the routers present in ~/.agents/skills:
    using-agent-skills, using-superpowers, ask-matt. The count must be 1, and it must be the set
    recorded as WORKFLOW_SET. Two routers is the failure mode section 4a exists to prevent, and it
    produces no broken link, no empty directory, and no error — only inconsistent behaviour.
  - The chosen set's skill count matches upstream. Enumerate every directory holding a SKILL.md in
    that set's source and confirm each has a link in ~/.agents/skills. Report the upstream count, the
    linked count, and any name present upstream but missing locally. These must be equal; a smaller
    local count is a stale install, not a healthy one. Set A is 24 skills today; set C enumerates all
    categories including in-progress. Do not hardcode either number — read the source tree.
  - For set A: the 8 slash commands resolve under ~/.claude/commands/agent-skills/ and the 4 personas
    under ~/.claude/agents/, and the agent-skills SessionStart hook is NOT registered unless I asked.
  - For set C only: the canonical ask-matt SKILL.md does not contain 'disable-model-invocation: true',
    and every installed ask-matt link resolves to that same file.
  - The router named in step 1 of the instruction file is the router that is actually installed.
  - Every CLI responds to --version / --help.
  - Every MCP server passes the handshake probe from step 6.3.
  - Instruction-file checksums are identical across all documented agent paths, including Jcode's
    \`~/AGENTS.md\` and Pi's \`~/.pi/agent/AGENTS.md\`.
  - The instruction file carries the \`~/.agents/rules/rules.md\` line, that file is readable and
    non-empty, and every rule it held before this run is still there.
  - No autonomous loop was started, no Context Diet restriction was activated, no paid service was
    authenticated, and no credits were spent.
  - gpt-image-2 is configured but not wired to trigger on anything except an explicit request.
  - On macOS, ego-browser resolves on PATH and answers the heredoc probe from 5b.5, or is reported
    as PENDING-USER because GUI onboarding is unfinished. On other platforms, ego lite is reported
    as SKIPPED-UNSUPPORTED; Playwright is allowed as a separate fallback and, if installed, its
    package and browser versions are reported.
  - ai-memory: EXACTLY ONE server process (ps -axo pid,%cpu,rss,command | grep ai-memory), listening
    on 127.0.0.1 and not 0.0.0.0 (lsof -nP -iTCP:<port> -sTCP:LISTEN), 'ai-memory status' reporting
    "embedding: disabled", an empty models/ directory, [auto_improve.scheduler] disabled,
    capture_assistant unset on both the server and the installed hooks, and a real
    initialize -> tools/list handshake against http://127.0.0.1:<port>/mcp returning the memory_*
    tools. Then confirm each wired agent sees it with that agent's own MCP command where one exists
    (claude mcp list, codex mcp list, hermes mcp test ai-memory). A config file that contains the
    right string is NOT evidence that anything connected.
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
