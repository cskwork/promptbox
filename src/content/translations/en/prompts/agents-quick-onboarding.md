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
| **Matt Pocock Skills** (37) | Skills | mattpocock/skills | `ask-matt` for design, debugging, and trade-offs, plus `tdd`, `triage`, `code-review`, `research`, `prototype`, `implement`, `to-spec`, and more |
| context-diet | Skill | cskwork/context-diet-skill | Measures and reduces system-prompt bloat |
| autoresearch | Skill | uditgoenka/autoresearch | Autonomous research loops |
| call-agent | Skill | cskwork/call-agent | Routes delegated work to Codex, agy, Kiro, Claude, and NotebookLM |
| archify | Skill | tt-a1i/archify | Produces architecture, sequence, and data-flow diagrams as standalone HTML |
| hallmark | Skill | Nutlope/hallmark | Designs, audits, and redesigns interfaces without the generic AI look |
| gpt-image-2 | Skill | agentspace-so/agent-skills | Generates images through a ChatGPT subscription without separate image API billing |
| clean-code | Skill | cskwork/clean-code | Refactors legacy code without changing behavior by locking in characterization tests first and editing in small batches |
| debug-code | Skill | cskwork/promptbox (skills/debug-code) | Evidence-first debugging that finds the earliest broken invariant and applies the smallest safe patch, including production-only, intermittent, performance, and legacy bugs |
| **ego-browser** | Skill + browser app | citrolabs/ego-lite | An agent browser that can reuse your login state for QA and web automation. macOS only; use Playwright when needed on Windows or Linux |
| **officecli** (11) | Skills + CLI | iOfficeAI/OfficeCLI | Creates and analyzes DOCX, XLSX, and PPTX files, with layers for financial models, pitch decks, and academic papers |
| **herdr** | Skill + CLI | ogulcancelik/herdr | A terminal multiplexer built for coding agents |
| **rtk** | CLI + hooks | rtk-ai/rtk | Compresses shell command output (git, pytest, docker, and 100+ others) before it reaches the model's context. It attaches through a `PreToolUse` hook, not an MCP server |

> The prompt does not assume a fixed number of installed CLIs. It first checks whether each tool reads `~/.agents/skills` directly, then creates only the adapters that are actually needed.

## When to use it

- When setting up a new laptop or server and you want your frequently used skills installed in one pass.
- When you use a mix of Claude Code, Codex, Jcode, Pi, Gemini CLI, Cursor, Kiro, and OpenCode, but do not want to copy the same rules and skills into every tool. Update `~/.agents/` once and they all follow it.
- **When the environment is damaged.** If an agent says a skill is missing, run the same prompt again to audit and repair it.

## What it does

1. **Inventories the current state before touching anything** in `inventory.tsv`, so every replacement has a restore path.
2. Makes `~/.agents/` the single source of truth for shared `AGENTS.md` rules, linked skills, cloned sources, setup scripts, documentation, and the install manifest.
3. Clones upstream repositories and links each complete skill directory into `~/.agents/skills/<name>`. Existing items are updated, while incomplete or broken items are repaired.
4. Detects installed coding CLIs and connects only their documented global instruction and skill paths to the shared hub.
5. Installs the required CLI tools and MCP servers, then validates MCP integrations with a real protocol handshake rather than merely checking that a process starts. `rtk` is installed here too, and `rtk init -g` wires its hook into each detected agent.
6. Finds codebase-indexer MCP servers such as codebase-memory-mcp, lists them for you, and removes them **only after you approve**.
7. Leaves behind a read-only audit script and an idempotent repair script for future failures.

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
- **rtk and codebase-indexer MCP servers pull against each other.** rtk shrinks what enters the context, while an indexer MCP keeps a large tool schema resident and returns long index payloads. The prompt therefore finds the indexers, shows you the list, and waits for your consent before removing anything. Without approval it changes nothing and marks each entry `PENDING-USER-CONSENT`. Approved removals are backed up first, and only the registration is removed — caches, index databases, and binaries stay put.

The full prompt below is copied verbatim. Use **Copy prompt** to place the entire payload on the clipboard without selecting it manually.
