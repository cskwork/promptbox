---
language: en
target: prompts/agents-quick-onboarding
---

## In one line

A single setup prompt that gathers shared skills and system instructions under **one `~/.agents/` directory**, then connects them to every installed coding CLI with symlinks (shortcuts that let several paths point to the same files).

It is **idempotent**, so rerunning it is safe. The second run doubles as a repair tool.

## What gets installed, at a glance

Skills are linked into `~/.agents/skills/`, while their source repositories are cloned under `~/.agents/sources/<owner>/<repo>`. A single `git pull` updates the installed skills at their source.

| Name | Type | Source | What it adds |
|---|---|---|---|
| AGENTS.md | Shared rules | Operating instructions embedded in the prompt | One system prompt shared by every CLI |
| rules/rules.md | Domain rules | Written by you on this machine | Domain and safety rules that differ per environment. Keeps the instruction file identical everywhere while the rules vary. Never overwritten |
| **Workflow set — pick one** (default A) | Skill bundle | A: addyosmani/agent-skills · B: obra/superpowers · C: mattpocock/skills | The layer that decides *how* the agent works. **Install exactly one** — the routers claim the same task, so two is a bug, not a bonus. Section 4a of the prompt shows the table below and asks before installing anything |
| **A. Agent Skills** (default, 24) | Skills | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Forces the whole lifecycle: DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP, one slash command per phase (`/spec` `/plan` `/build` `/test` `/review` `/code-simplify` `/webperf` `/ship`), four review personas, router `using-agent-skills` |
| B. Superpowers (optional) | Skills | obra/superpowers | Plans deeply up front, then runs hands-off: git worktree isolation and a fresh subagent per task |
| C. Matt Pocock Skills (optional, whole repo) | Skills | mattpocock/skills | `ask-matt` for design, debugging, and trade-offs, plus `grilling`, `tdd`, `triage`, `to-spec`, `wayfinder`, and more |
| **wait-what** (set-independent, always installed) | Skill | [mattpocock/skills](https://github.com/mattpocock/skills) (`skills/productivity/wait-what`) | The one keystroke for when a reply does not land: it asks the agent to re-pitch with context, in ASD-STE100 Simplified Technical English, using the ubiquitous language from `CONTEXT.md`. Six lines, no pipeline, no router — it cannot conflict with a workflow set, so it is installed even when you pick A or B. Its `disable-model-invocation: true` is deliberate: you invoke it at the moment you are confused, so leave the flag alone |
| context-diet | Skill | cskwork/context-diet-skill | Measures and reduces system-prompt bloat |
| autoresearch | Skill | uditgoenka/autoresearch | Autonomous research loops |
| call-agent | Skill | cskwork/call-agent | Routes delegated work to Codex, agy, Kiro, Claude, and NotebookLM |
| archify | Skill | tt-a1i/archify | Produces architecture, sequence, and data-flow diagrams as standalone HTML |
| impeccable | Skill | pbakaus/impeccable | The **default design skill** for every frontend task — 23 design commands, PRODUCT.md/DESIGN.md context, and per-edit detector hooks that keep the generic AI look out |
| gpt-image-2 | Skill | agentspace-so/agent-skills | Generates images through a ChatGPT subscription without separate image API billing |
| clean-code | Skill | cskwork/clean-code | Refactors legacy code without changing behavior by locking in characterization tests first and editing in small batches |
| verify | Skill | cskwork/verify-skill | Five gates that refuse to call a green build verified: build, static checks, clean-code review, scenario API QA, report. Each gate leaves a re-runnable receipt, and a gate that could not run is BLOCKED rather than PASS. Ships a token module and payload variants (happy, boundary, negative). Needs curl and jq |
| **ego-browser** | Skill + browser app | citrolabs/ego-lite | An agent browser that reuses your login state for QA and web automation — the kit's **default browser on macOS**. macOS only; use Playwright when needed on Windows or Linux |
| debug-code | Skill | cskwork/promptbox (skills/debug-code) | Evidence-first debugging that finds the earliest broken invariant and applies the smallest safe patch, including production-only, intermittent, performance, and legacy bugs |
| **officecli** (11) | Skills + CLI | iOfficeAI/OfficeCLI | Creates and analyzes DOCX, XLSX, and PPTX files, with layers for financial models, pitch decks, and academic papers |
| **herdr** | Skill + CLI | ogulcancelik/herdr | A terminal multiplexer built for coding agents |
| **rtk** | CLI + hooks | rtk-ai/rtk | Compresses shell command output (git, pytest, docker, and 100+ others) before it reaches the model's context. It attaches through a `PreToolUse` hook, not an MCP server |
| omp — oh-my-pi (when detected) | Agent (harness) | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) | A single-binary all-in-one coding agent with LSP, a real debugger, and browser automation built in. Not part of the default kit — when already present it is detected and wired to the hub through `~/.omp/agent/`; when absent the prompt only reports the install command |

> The prompt does not assume a fixed number of installed CLIs. It first checks whether each tool reads `~/.agents/skills` directly, then creates only the adapters that are actually needed.

## Three philosophies — which one to pick

The prompt shows this table **before** installing any skill and asks for A, B, or C. With no answer,
or in a non-interactive run, it installs **A (Agent Skills)** and says so in its report.

| Aspect | **A. Agent Skills** (default) | B. Superpowers | C. Matt Pocock Skills |
|---|---|---|---|
| Author | Addy Osmani | Jesse Vincent (obra) | Matt Pocock |
| Philosophy | Encode the whole lifecycle, **human checkpoint at each phase** | Reason deeply up front, then **hands-off autonomous execution** | **Requirements first**; refuses to own your process |
| Size | 24 skills over 6 phases | 6 pipeline stages | Many small modular skills |
| Invocation | 8 slash commands | The pipeline activates itself | User-invoked and model-invoked kept separate |
| Execution | Stops at each phase (`/build auto` runs a whole approved plan on its own) | Fresh subagent per task in an isolated git worktree | One agent with light guidance |
| Signature | Four review personas fan out in parallel at ship; CI evals that test the skills; explicit rebuttals to rationalizations like "I'll write tests later" | 2–5 minute task granularity with exact file paths; code review between every task | `grilling` — one question at a time, dependency-aware requirements interrogation |
| Strongest | Breadth: security, performance, observability, CI/CD, deprecation; a shared team vocabulary | Ambiguous exploratory work; approve once and walk away; easy to cherry-pick | When the bottleneck is an unclear spec; easy to read and rewrite |
| Weakest | Opinionated and interlinked, so extending it risks routing conflicts; least composable | Heavy overhead on small, well-defined tasks | Thinner coverage on long lifecycles; needs you in the loop more often |
| Pick it when | Production features that go through security review to deploy; team standardization | A big task with fuzzy architecture that you want to delegate and stop supervising | You know roughly what to build but not exactly what it should do |

- **None of them fits a small, well-defined task** — the process overhead outweighs the benefit.
- **There is no benchmark.** No published experiment compares any of the three against plain
  prompting without skill scaffolding, and the context they occupy can hurt on simple tasks. Treat
  the choice as a preference about how much control you want, not a measured performance claim.
- Comparison source: [Superpowers vs Agent Skills vs Pocock — dev.to/jamilxt](https://dev.to/jamilxt/superpowers-vs-agent-skills-vs-pocock-three-philosophies-of-ai-coding-workflows-e6n)
  · catalog entries: [Agent Skills](../../plugins/agent-skills/) · [Superpowers](../../plugins/superpowers/)

## When to use it

- When setting up a new laptop or server and you want your frequently used skills installed in one pass.
- When you use a mix of Claude Code, Codex, Jcode, Pi, Gemini CLI, Cursor, Kiro, and OpenCode, but do not want to copy the same rules and skills into every tool. Update `~/.agents/` once and they all follow it.
- **When the environment is damaged.** If an agent says a skill is missing, run the same prompt again to audit and repair it.

## What it does

1. **Inventories the current state before touching anything** in `inventory.tsv`, so every replacement has a restore path.
2. **Asks you to pick one workflow set** and installs no skill until you answer. If another set is already installed and you pick a different one, it **switches instead of stacking**: the old links move to `~/.agents/disabled-skills/<set>-<timestamp>/` (moved, never deleted) and their names go into `skills-excluded` — that last step is the one that matters, because a relink pass otherwise resurrects an unlinked set with nothing broken to reveal it.
3. Makes `~/.agents/` the single source of truth for shared `AGENTS.md` rules, linked skills, cloned sources, setup scripts, documentation, and the install manifest.
4. Clones upstream repositories and links each complete skill directory into `~/.agents/skills/<name>`. Existing items are updated, while incomplete or broken items are repaired.
5. Detects installed coding CLIs and connects only their documented global instruction and skill paths to the shared hub.
6. Installs the required CLI tools and MCP servers, then validates MCP integrations with a real protocol handshake rather than merely checking that a process starts. `rtk` is installed here too, and `rtk init -g` wires its hook into each detected agent.
7. Finds codebase-indexer MCP servers such as codebase-memory-mcp, lists them for you, and removes them **only after you approve**.
8. Leaves behind a read-only audit script and an idempotent repair script for future failures.

## Gotchas the prompt handles

Every item below comes from a failure that occurred in a real setup. The prompt includes a guard for each one.

- **A directory existing does not mean the skill is installed.** An interrupted installer can leave correctly named but empty directories. Agents then report that the skill is missing even though `ls` shows the directory. Installation must be proven by a readable, non-empty `SKILL.md`, never by `[ -d ... ]` alone.
- **Upstream installers may run `rm -rf`.** For example, a development-oriented link script can delete an existing real directory before replacing it. The prompt reads installer scripts first and reimplements destructive linking with backup semantics.
- **An MCP installer may also rewrite agent configuration.** An MCP install script can configure MCP files, instructions, skills, and hooks for detected agents. The prompt inspects the installer, uses binary-only installation when appropriate, and then registers the server according to the existing configuration rules.
- **A global MCP config may accidentally hardcode `cwd`.** Installers sometimes pin the server to the directory where setup ran. Removing that value is required for the server to work correctly across projects.
- **User-owned symlinks can be lost during reconciliation.** Links to personal repositories outside `~/.agents` must be inventoried and preserved verbatim instead of being silently retargeted.
- **Version-manager shims may fail in a non-interactive shell.** A `node` shim can break while `/opt/homebrew/bin/node` works. The prompt resolves and stores the absolute path of an interpreter that actually runs in the environment used by the agent.
- **A tool cannot always update itself while it is running.** Herdr may download an update but fail to replace its active binary from inside a Herdr session. The prompt does not work around that lock and instead reports the exact command to run after exiting.
- **The ego lite browser needs a human to finish installation.** The script can install the DMG, but first-run GUI onboarding registers the `ego-browser` command and asks whether to import Chrome data. The agent must stop and wait rather than answering that privacy-sensitive question for you. ego lite is macOS-only; Playwright remains a separate fallback on other platforms.
- **Old sibling instruction files can remain active.** Replacing the canonical instruction file is not enough if another file in a directory such as Kiro steering still injects the previous rules. The prompt inventories and archives those stale siblings.
- **Windows uses different fallback link types for files and directories.** Without Developer Mode or administrator privileges, files can use hard links while skill directories require junctions. A directory cannot be hard-linked with `mklink /H`.
- **A verification script must not mutate the system.** Passing an unsupported `--dry-run` flag to a script can silently execute the real operation. The prompt creates a separate read-only audit script instead of trusting an unverified dry-run mode.
- **omp (oh-my-pi) is a separate agent from Pi.** It reads `~/.omp/agent/`, not `~/.pi`. It is not part of the default kit: the prompt only detects and wires an existing install. Skill loading must be verified by asking the omp engine itself to list its skills — a directory check proved nothing, which is exactly why one run ended with "omp skill loading unverified". Registering ai-memory's S4U logon task also needs one elevated shell: a plain session fails with Access denied, and that is the single elevated command the whole setup needs.
- **rtk and codebase-indexer MCP servers pull against each other.** rtk shrinks what enters the context, while an indexer MCP keeps a large tool schema resident and returns long index payloads. The prompt therefore finds the indexers, shows you the list, and waits for your consent before removing anything. Without approval it changes nothing and marks each entry `PENDING-USER-CONSENT`. Approved removals are backed up first, and only the registration is removed — caches, index databases, and binaries stay put.

The full prompt below is copied verbatim. Use **Copy prompt** to place the entire payload on the clipboard without selecting it manually.
