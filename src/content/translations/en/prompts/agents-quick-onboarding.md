---
language: en
target: prompts/agents-quick-onboarding
---

## In one line

**pi** is the default harness. This prompt checks Node.js and pi, synchronizes the canonical
[`cskwork/pi-setup-public`](https://github.com/cskwork/pi-setup-public) repository into `~/pi-setup-public`, and runs its
installer to restore the complete environment.

## What it does

1. Checks Node.js 22+ and `pi`, installing only what is missing.
2. Synchronizes `~/pi-setup-public` with `git pull --ff-only` without discarding local work.
3. Confirms that `glm-5.3-flash` declares both `text` and `image` input.
4. Runs the repository installer to connect settings, agents, skills, and model profiles under `~/.pi/agent/`.
5. Verifies authentication, model discovery, packages, a text round trip, and native image input when an image is available.

## Gotchas

- Local changes are never discarded. The prompt forbids `reset --hard`, `git clean`, and `rm -rf`.
- API keys never go into chat. Missing authentication remains an explicit user action through `pi auth`.
- On Windows, the agent must follow the repository's documented path rather than inventing a PowerShell translation of a bash script.

Use the **Copy prompt** button on the catalog page and paste the payload into any coding agent that is already running.
