---
title: 코딩 에이전트 온보딩 한 방 설치
summary: "추천 스킬 한 묶음과 공통 시스템 프롬프트를 ~/.agents/ 한곳에 모아 설치하고, 설치된 모든 코딩 CLI(.claude·.codex·.gemini·opencode 등)에 자동으로 심링크 연결하는 복사-붙여넣기 프롬프트. 이미 있으면 최신으로 업데이트한다."
summary_en: "One paste-and-go prompt that installs a curated skill set plus a shared system prompt into a single ~/.agents/ dir, then symlinks it into every coding CLI you have — updating anything already there."
tags: [onboarding, install, skills, system-prompt, symlink, agents-dir, dotfiles]
author: cskwork
order: 5
use_case: "새 머신을 세팅하거나 여러 코딩 CLI의 스킬·규칙을 한곳에서 관리하고 싶을 때. 에이전트 채팅창에 그대로 붙여넣으면 끝."
---

## 한 줄

추천 스킬 묶음과 공통 시스템 프롬프트를 `~/.agents/` **한 폴더**에 모으고, 설치된 모든 코딩 CLI에
심링크(symlink, 한 파일을 여러 위치에서 가리키게 하는 바로가기)로 연결하는 단일 설치 프롬프트.

## 언제 쓰는가

- 새 노트북·서버를 세팅하면서 자주 쓰는 스킬을 한 번에 깔고 싶을 때
- Claude Code·Codex·Gemini CLI·OpenCode를 섞어 쓰는데, 규칙(시스템 프롬프트)과 스킬을
  도구마다 따로 복사하기 싫을 때 — `~/.agents/` 하나만 고치면 전부 따라온다

## 무엇을 하는가

1. `~/.agents/`를 단일 출처로 만든다 — `AGENTS.md`(공통 규칙) + `skills/`(스킬 모음).
2. 추천 스킬을 각 소스에서 받아 `~/.agents/skills/<이름>/`에 설치한다. **이미 있으면 최신으로 업데이트.**
3. 설치된 CLI를 감지해 각 도구의 규칙 파일·스킬 폴더를 `~/.agents/`로 심링크한다.

## 함정

- **심링크 권한**: Windows는 개발자 모드(Developer Mode) 또는 관리자 터미널이 있어야 심링크를 만든다.
  둘 다 없으면 프롬프트가 자동으로 폴백한다 — 폴더는 정션(junction), 파일은 하드링크(hardlink)로
  연결(둘 다 권한 불필요). macOS·Linux는 `ln -s` 한 줄로 끝나 별도 권한이 필요 없다.
- **기존 파일 보존**: 프롬프트가 덮어쓰기 전에 `<파일>.bak-<시각>`으로 백업하도록 지시한다 —
  그래도 중요한 `CLAUDE.md`가 있다면 먼저 따로 챙겨 두자.
- **도구별 스킬 지원 차이**: 전역 `skills/` 폴더를 읽는 건 Claude Code(`~/.claude/skills`)·Codex(`~/.codex/skills`)
  등 일부뿐. 나머지는 규칙 파일만 연결된다.
- **Gemini CLI·Antigravity는 파일명이 다르다** (2026-06 기준): 둘 다 기본 파일이 `AGENTS.md`가 아니라
  `~/.gemini/GEMINI.md` (Antigravity가 Gemini 전역 파일을 공유 — 알려진 충돌). Gemini에서 `AGENTS.md`
  이름을 쓰려면 `~/.gemini/settings.json`에 `"context": { "fileName": ["AGENTS.md", "GEMINI.md"] }`를
  먼저 넣어야 한다. Antigravity는 워크스페이스에서 `.agents/` 디렉터리(`.agents/agents.md`·`.agents/skills/`)를
  네이티브로 인식한다. Cursor는 전역 파일 없이 레포 루트 `AGENTS.md`, Windsurf(현 **Devin Desktop**)는 레포
  루트 `AGENTS.md`(always-on), Kilo Code는 `~/.config/kilo/AGENTS.md`를 읽는다 — 프롬프트가 도구별로
  올바른 경로에 연결한다.

아래 프롬프트를 에이전트 채팅창에 그대로 붙여넣으세요.

```text
You are setting up my global AI coding-agent environment. Build ONE shared source of truth at ~/.agents/ and symlink it into every coding CLI I already have installed.

Rules:
- Be idempotent. If something already exists, UPDATE it to the latest version instead of duplicating.
- Never delete my data. Back up any real file you replace to <file>.bak-<timestamp> before symlinking over it.
- Resolve ~ to my home directory on the current OS, and use the matching link command:
    macOS/Linux: ln -s
    Windows (PowerShell): New-Item -ItemType SymbolicLink -- needs Developer Mode or an admin terminal. If neither is available, fall back by target type: a directory -> New-Item -ItemType Junction (no elevation needed); a file -> New-Item -ItemType HardLink (same drive, no elevation); copy only as a last resort and tell me it will not auto-update.
- Do not commit or push anything. Print a summary of created / updated / skipped / backed-up at the end.

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
     zoom-out                       github.com/mattpocock/skills  -> skills/engineering/zoom-out
     skill-creator                  github.com/anthropics/skills  -> skills/skill-creator
     ssh-llm-connect                github.com/cskwork/ssh-llm-connect        (copy its SKILL.md; run install.sh per project when you need the SSH guard)
     claude-code-workflow-cheatsheet github.com/cskwork/claude-code-workflow-cheatsheet
     jk (Jenkins CLI)               github.com/avivsinai/jenkins-cli          (install the jk binary per its README, then add a SKILL.md so agents can drive it)
     autoresearch                   github.com/uditgoenka/autoresearch        (install per its README; it is a plugin/skill)
   These are whole-repo skills (SKILL.md plus agents/ reference/ templates/) -- copy the ENTIRE repo into ~/.agents/skills/<name>/, not just SKILL.md:
     supergoal                      github.com/cskwork/supergoal-skill
     superpm                        github.com/cskwork/superpm-skill
     superdesign                    github.com/cskwork/superdesign-skill
     superoffice                    github.com/cskwork/superoffice-skills
     superhacker                    github.com/cskwork/superhacker-skill      (authorized security testing / CTF / learning only)

   Command-line tools in the kit (install the binary; no skill folder needed):
     supertonic-tts   npm i -g supertonic-tts    (local text-to-speech CLI)
     figma-cli        npm i -g figma-ds-cli       (Figma design-system CLI; add a SKILL.md wrapper so agents can drive it -> skills/figma-cli)

3. Symlink ~/.agents into every coding CLI I have
   Detect which are installed (config dir present or binary on PATH; use each tool's OS-correct
   config path). For each present tool, replace its global rules file with a symlink to
   ~/.agents/AGENTS.md -- the link NAME differs per tool (CLAUDE.md / AGENTS.md / GEMINI.md) but
   all point at the one file -- and where the tool has a global skills dir, symlink it to
   ~/.agents/skills. Back up any real file first. Current (2026) per-tool paths:
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

4. Verify
   List ~/.agents/skills/, confirm every symlink resolves to ~/.agents, and print the summary.
```
