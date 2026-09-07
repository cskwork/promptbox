---
language: en
target: prompts/agents-quick-onboarding
---

## In one line

**pi** is the default harness. This prompt checks Node.js, installs or updates pi to the latest release, synchronizes the canonical
[`cskwork/pi-setup-public`](https://github.com/cskwork/pi-setup-public) repository into `~/pi-setup-public`, and runs its
installer to restore the complete environment.

## What it does

1. Checks the current Node.js requirement, installs pi if missing or updates an existing installation, and verifies the before/after versions.
2. Synchronizes `~/pi-setup-public` with `git pull --ff-only` without discarding local work.
3. Confirms that `glm-5.3-flash` declares both `text` and `image` input.
4. Runs the repository installer to connect settings, agents, skills, and model profiles under `~/.pi/agent/`.
5. Downloads the current `main/AGENTS.md` from `cskwork/THE-SYSTEM-PROMPT`, backs up any differing local file, and shares the exact source across installed coding agents.
6. Verifies the system prompt byte-for-byte, authentication, model discovery, packages, a text round trip, and native image input when an image is available.

The default installation includes **Impeccable**. It excludes `supergoal`, `superdesign`,
`superoffice`, and `superhacker`. User-owned copies installed separately are preserved.

## Gotchas

- Local changes are never discarded. The prompt forbids `reset --hard`, `git clean`, and `rm -rf`.
- API keys never go into chat. Missing authentication remains an explicit user action through `pi auth`.
- On Windows, the agent must follow the repository's documented path rather than inventing a PowerShell translation of a bash script.

Use the **Copy prompt** button on the catalog page and paste the payload into any coding agent that is already running.
