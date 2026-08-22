---
title: SwarmForge Router
summary: "SwarmForge 2/4/6-에이전트 팩(pack, 역할 묶음)을 요청에 맞게 추천하고 확인을 받은 뒤 프로젝트 로컬 워크플로우로 설치해, 역할 브랜치 통합까지 검증하는 독립 스킬."
summary_en: "Routes a coding request to the right SwarmForge multi-agent pack (2/4/6 roles), installs it project-locally with provenance, and verifies the handoff integration."
tags: [skill, swarmforge, multi-agent, orchestration, workflow, tmux, git-worktree, cskwork]
source: https://github.com/cskwork/swarm-agent-skill
author: cskwork
license: MIT
order: 40
trigger: "Use $swarm-forge to set up a swarm for this request · set up swarmforge · two/four/six-pack swarm · multi-agent workflow"
install: "git clone https://github.com/cskwork/swarm-agent-skill and link skills/swarm-forge into your agent skills directory as swarm-forge"
---

## 한 줄

요청의 규모와 위험도에 따라 SwarmForge 팩(pack, 역할 묶음) 2/4/6 중 하나를 추천하고, 확인을 받아 프로젝트 로컬에 다중 에이전트 워크플로우를 설치한 뒤, 역할 브랜치(role branch, 역할별 작업 브랜치) 통합까지 검증하는 라우터 스킬.

## 언제 쓰는가

- 작업이 커서 여러 역할로 나눠 돌리고 싶을 때 — `Use $swarm-forge to set up a swarm for this request` 한 문장으로 시작한다.
- 명확하고 국소적인 저위험 작업은 Two-pack(coder→cleaner→coder), 명세와 아키텍처 리뷰가 필요하면 Four-pack(specifier→coder→refactorer→architect), 릴리스 크리티컬·보안·UI 작업은 Six-pack(여기에 hardender+QA가 더해짐).

## 무엇을 하는가

- 먼저 읽기 전용 inspect(점검)로 프로젝트 상태와 prerequisite(필수 구성요소)를 확인한다.
- 팩 추천 + 확인 → `<base-ref> -> <target-branch>` 통합 경로 선택을 차례로 묻고, base-ref(기준 커밋)와 target-branch(대상 브랜치)를 사용자가 정하게 한다.
- 업스트림(upstream, 원본 프로젝트) SwarmForge를 커밋 고정 아카이브로 임시 디렉터리에 내려받고, provenance(설치 출처 기록)와 함께 프로젝트 로컬 파일로만 설치한다.
- 실행은 별도 확인을 거쳐 tmux 타일 창으로 열리고, 끝나면 역할 브랜치가 대상 브랜치에 병합됐는지·worktree(역할별 작업 복사본)가 깨끗한지 검증해 보고한다.

## 함정

- 업스트림 코드를 벤더(vendor, 복사해 내장)하지 않는다 — 항상 업스트림 아카이브를 내려받아 설치한다.
- 실행 시점에 zsh + tmux가 필요하다. Windows 등에서 없으면 즉석에서 우회하지 말고 누락된 prerequisite을 그대로 보고한다.
- 설치된 팩 파일은 실행 전에 대상 브랜치에 커밋돼야 역할 worktree에 전달된다.
- 기존 설치를 덮어쓰거나 drift(내용 어긋남)를 임의로 고치지 않는다 — 복구 계획을 사용자가 승인해야 한다.

````markdown
---
name: swarm-forge
description: Recommend, install, launch, and verify Robert C. Martin's SwarmForge as a project-local multi-agent workflow. Use when a user asks to set up, inspect, run, or verify unclebob/swarm-forge, or wants a two-, four-, or six-agent software-development swarm.
---

# SwarmForge

Use the upstream SwarmForge project without vendoring it into this skill. Read
[`references/upstream.md`](references/upstream.md) before installing or running.

## Choose a pack

Assess the request, recommend one pack with a one-sentence reason, and always ask
the user to choose `2`, `4`, or `6` before installation:

- Recommend `2` for a localized, clear, low-risk task in one subsystem.
- Recommend `4` for moderate cross-layer work that benefits from specification
  and architectural review.
- Recommend `6` for major, security-sensitive, migration, public-API, UI/E2E,
  release-critical, or high-regression-risk work.

Ask even when the request already names a pack; confirm that choice once. Do not
treat silence in an interactive turn as consent. Default to `2` only when the
user explicitly delegates the choice, submits an empty answer, or the
environment cannot request input. State whenever this default is used.

## Choose the integration route

Before installation, inspect local branches and ask the user to choose a route
in the form `<base-ref> -> <target-branch>`. The target is the primary checkout
branch that receives role handoffs. Recommend the current branch when work is
already isolated there; recommend a new task branch from the chosen base when
the current branch should remain untouched.

If the target does not exist, create it from the confirmed base only after the
user approves that branch operation. If it exists, do not reset or recreate it.
The selected target must be checked out at the project root before installation
and launch. Resolve the target from the actual checkout: upstream's `master`
config value means the primary checkout, whatever its branch name.

Default the base and target to the current branch only when the user explicitly
delegates the choice or input is unavailable. State the resolved route and stop
on a detached HEAD, a dirty checkout that prevents switching, or an ambiguous
ref.

## Inspect

Run the read-only inspection first:

```zsh
zsh <skill-dir>/scripts/swarmforge-project.sh inspect --project <absolute-project-path>
```

Report every prerequisite line the helper prints. If any is missing, read
[`references/prerequisites.md`](references/prerequisites.md) and have the user
resolve it; the helper refuses to launch while any prerequisite is missing.
Never install global software or alter backend credentials.

## Install

After pack confirmation, run exactly one explicit pack value:

```zsh
zsh <skill-dir>/scripts/swarmforge-project.sh install \
  --project <absolute-project-path> \
  --pack <2|4|6>
```

The helper resolves the live official branch heads, downloads commit-pinned
archives into a temporary directory, validates them, and installs only
project-local runtime files. It combines missing official shared constitution
articles with pack-local overrides, records the upstream URL and exact pack and
`main` commits, and does not overwrite an existing install, repair drift,
switch packs, or copy upstream code into this skill repository.

In an existing Git repository, commit every installed non-script file on the
selected target before launch: `swarm`, `.swarmforge-install`, `.gitignore`, and
the configuration, role prompts, active constitution articles, and protocol
files under `swarmforge/`. Ask before creating that commit. Upstream creates
role worktrees from target `HEAD`; uncommitted setup files would not appear in
those worktrees. `swarmforge/scripts/` is intentionally ignored because the
launcher synchronizes that pinned runtime into role worktrees.

If a conflict or drift is reported, stop and show the exact paths. Do not remove,
rename, or replace them without a separate user-approved recovery plan.

## Run

Before launching, tell the user that upstream SwarmForge normally can initialize
Git and create an initial commit in a new project. This helper instead requires
the user-approved custom target branch and setup commit to exist first. Also
disclose that launch creates `.worktrees/` and `.swarmforge/`, opens tmux
sessions and one tiled window in the current terminal, starts multiple agent
backends, and may temporarily inhibit system sleep. Pass the confirmation flag
only after the user has approved those effects:

```zsh
zsh <skill-dir>/scripts/swarmforge-project.sh run \
  --project <absolute-project-path> \
  --target-branch <confirmed-target-branch> \
  --confirm-side-effects
```

Pass upstream arguments only after `--`. The helper verifies the recorded
installation, requires the selected local target to be the current primary
checkout branch, checks every installed non-script file against target `HEAD`,
and executes only that project's `./swarm`. Role worktrees are created from
that target. The helper does not perform or prescribe a later source-to-target
merge.

## Terminal placement

Run always defaults to `--terminal none`, so every role stays in the terminal
the user is already in. Upstream detection would otherwise open one new
terminal window per role, which scatters a six-pack across six windows.

With the default, the helper exports `SWARMFORGE_TERMINAL=none`, launches
`./swarm` with stdin closed so upstream's own attach cannot claim the caller's
terminal, and then tiles one pane per live role session into a single new
`swarm-<project>` window of the tmux session that terminal already has
attached. Each pane runs `tmux -S <swarm-socket> attach-session -d -t
<role-session>` with `TMUX` cleared, and carries the role name in its pane
border. Keys typed in a pane reach the role's tmux through the doubled prefix
`C-b C-b`.

Change the terminal backend only when the user asks. `--terminal auto` gives
each role a separate terminal window: it hands detection back to upstream and
skips tiling. `--terminal iterm2|terminal-app|ghostty|windows-terminal`
pins one upstream adapter. `--no-attach` launches in place and leaves tiling
to a later `attach`.

If the tiling step fails, or the swarm was launched some other way, tile the
live sessions into the current terminal with:

```zsh
zsh <skill-dir>/scripts/swarmforge-project.sh attach \
  --project <absolute-project-path>
```

`attach` reads `.swarmforge/tmux-socket` and `.swarmforge/sessions.tsv`, skips
role sessions that are no longer alive, and fails without launching anything
when no live session remains. If no tmux client is attached, it creates a
`swarmforge-view` session and prints the command to attach it.

## Verify integration

The upstream role prompts instruct recipients to merge incoming handoffs during
the run, but the launcher does not enforce those merges transactionally. Do not
add an arbitrary merge after the swarm. After the swarm reports completion,
run:

```zsh
zsh <skill-dir>/scripts/swarmforge-project.sh verify \
  --project <absolute-project-path> \
  --target-branch <confirmed-target-branch>
```

During a live run, a recipient may receive a payload written as
`merge_and_process <sender> <sha>` even though no command by that name is
installed. If the role stalls on that missing command, follow the exact guarded
compatibility procedure in
[`references/upstream.md`](references/upstream.md#handoff-payload-compatibility).
This exception applies only to the current durable handoff inside its recipient
worktree; it does not authorize a later arbitrary merge into the target.

Report `integration: verified` only when the target checkout and every expected
role worktree are clean, and every expected `swarmforge-*` role branch is an
ancestor of the selected target. A missing role branch or worktree means launch
is not proven; an unmerged branch, conflict, dirty checkout, failed agent, or
missing handoff is `integration: not verified` and must be shown to the user.
Do not merge, delete branches, or remove worktrees as an automatic recovery
action.

Report installation and launch separately, including exact commits, pack,
prerequisite blockers, the selected base-to-target route, whether the swarm
process actually started, the terminal backend and the tmux window the roles
were tiled into, and the final integration verification result.
````
