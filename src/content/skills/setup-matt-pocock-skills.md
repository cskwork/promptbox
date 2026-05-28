---
title: setup-matt-pocock-skills
summary: "Matt Pocock 스킬 모음을 쓰기 전 한 번만 실행 — 이슈 트래커, 라벨 이름, 문서 위치를 물어보고 CLAUDE.md에 기록해 다른 스킬이 매번 묻지 않게 한다."
summary_en: "Run once before using Matt Pocock's other skills — records your issue tracker, label names, and doc layout in CLAUDE.md."
tags: [skill, setup, issue-tracker, triage, scaffolding, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/setup-matt-pocock-skills
author: mattpocock
license: mattpocock/skills 참조
order: 30
trigger: "set up matt pocock skills / setup-matt-pocock-skills / configure issue tracker / triage label setup / 도메인 docs 설정"
install: "npx skills add https://github.com/mattpocock/skills --skill setup-matt-pocock-skills"
---

## 한 줄

`to-issues`, `to-prd`, `triage`, `diagnose`, `tdd`, `improve-codebase-architecture`, `zoom-out` 같은 다른 스킬을 쓰기 전에 **이 스킬을 먼저 한 번 실행** — 이슈를 어디서 관리하는지, 분류 라벨 5개의 실제 이름, 프로젝트 문서 위치를 사용자와 합의한 뒤 `CLAUDE.md`(또는 `AGENTS.md`)와 `docs/agents/*.md`에 기록한다. 그래야 다른 스킬들이 매번 묻지 않고 이 프로젝트 규칙대로 동작한다.

*EN: Run this once so the other engineering skills know where your issues, labels, and docs live.*

## 세 가지 결정 (한 번에 하나씩)

| 섹션 | 결정 | 기본값 |
|---|---|---|
| A. 이슈 트래커 | GitHub / GitLab / local markdown(`.scratch/`) / Other(Jira·Linear 등 freeform) | git remote에서 추론 |
| B. Triage 라벨 매핑 | `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` 5개 canonical role의 실제 라벨 문자열 | 이름 그대로 |
| C. 도메인 docs 레이아웃 | single-context (`CONTEXT.md` + `docs/adr/`) vs multi-context (`CONTEXT-MAP.md` + per-context) | 대부분 single |

## 산출물

- `CLAUDE.md`(있으면) 또는 `AGENTS.md`의 `## Agent skills` 블록 — 세 결정의 one-line 요약 + `docs/agents/*.md` 포인터
- `docs/agents/issue-tracker.md` — 트래커별 seed 템플릿 (github/gitlab/local)
- `docs/agents/triage-labels.md` — 라벨 매핑
- `docs/agents/domain.md` — domain doc consumer rule

## 함정

- `CLAUDE.md`와 `AGENTS.md` **둘 다** 만들지 말 것 — 존재하는 쪽만 edit.
- 기존 `## Agent skills` 블록이 있으면 **in-place update**, 중복 append 금지.
- `disable-model-invocation: true` — 사용자가 명시적으로 부를 때만 실행.

## 원문 SKILL.md (전문)

````markdown
---
name: setup-matt-pocock-skills
description: Sets up an `## Agent skills` block in AGENTS.md/CLAUDE.md and `docs/agents/` so the engineering skills know this repo's issue tracker (GitHub or local markdown), triage label vocabulary, and domain doc layout. Run before first use of `to-issues`, `to-prd`, `triage`, `diagnose`, `tdd`, `improve-codebase-architecture`, or `zoom-out` — or if those skills appear to be missing context about the issue tracker, triage labels, or domain docs.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker** — where issues live (GitHub by default; local markdown is also supported out of the box)
- **Triage labels** — the strings used for the five canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config` — is this a GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at the repo root — does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/` — does this skill's prior output already exist?
- `.scratch/` — sign that a local-markdown issue tracker convention is already in use

### 2. Present findings and ask

Summarise what's present and what's missing. Then walk the user through the three decisions **one at a time** — present a section, get the user's answer, then move to the next. Don't dump all three at once.

Assume the user does not know what these terms mean. Each section starts with a short explainer (what it is, why these skills need it, what changes if they pick differently). Then show the choices and the default.

**Section A — Issue tracker.**

> Explainer: The "issue tracker" is where issues live for this repo. Skills like `to-issues`, `triage`, `to-prd`, and `qa` read from and write to it — they need to know whether to call `gh issue create`, write a markdown file under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that. If a `git remote` points at GitLab (`gitlab.com` or a self-hosted host), propose GitLab. Otherwise (or if the user prefers), offer:

- **GitHub** — issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab** — issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown** — issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.) — ask the user to describe the workflow in one paragraph; the skill will record it as freeform prose

**Section B — Triage label vocabulary.**

> Explainer: When the `triage` skill processes an incoming issue, it moves it through a state machine — needs evaluation, waiting on reporter, ready for an AFK agent to pick up, ready for a human, or won't fix. To do that, it needs to apply labels (or the equivalent in your issue tracker) that match strings *you've actually configured*. If your repo already uses different label names (e.g. `bug:triage` instead of `needs-triage`), map them here so the skill applies the right ones instead of creating duplicates.

The five canonical roles:

- `needs-triage` — maintainer needs to evaluate
- `needs-info` — waiting on reporter
- `ready-for-agent` — fully specified, AFK-ready (an agent can pick it up with no human context)
- `ready-for-human` — needs human implementation
- `wontfix` — will not be actioned

Default: each role's string equals its name. Ask the user if they want to override any. If their issue tracker has no existing labels, the defaults are fine.

**Section C — Domain docs.**

> Explainer: Some skills (`improve-codebase-architecture`, `diagnose`, `tdd`) read a `CONTEXT.md` file to learn the project's domain language, and `docs/adr/` for past architectural decisions. They need to know whether the repo has one global context or multiple (e.g. a monorepo with separate frontend/backend contexts) so they look in the right place.

Confirm the layout:

- **Single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root. Most repos are this.
- **Multi-context** — `CONTEXT-MAP.md` at the root pointing to per-context `CONTEXT.md` files (typically a monorepo).

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- The contents of `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, `docs/agents/domain.md`

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask the user which one to create — don't pick for them.

Never create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa) — always edit the one that's already there.

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Then write the three docs files using the seed templates in this skill folder as a starting point:

- [issue-tracker-github.md](./issue-tracker-github.md) — GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) — GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md) — local-markdown issue tracker
- [triage-labels.md](./triage-labels.md) — label mapping
- [domain.md](./domain.md) — domain doc consumer rules + layout

For "other" issue trackers, write `docs/agents/issue-tracker.md` from scratch using the user's description.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `docs/agents/*.md` directly later — re-running this skill is only necessary if they want to switch issue trackers or restart from scratch.
````
