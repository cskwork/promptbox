---
title: 코딩 에이전트 온보딩 한 방 설치
summary: "추천 스킬 한 묶음과 공통 시스템 프롬프트, CLI 도구(rtk·playwright-cli)와 codebase-memory-mcp를 ~/.agents/ 한곳에 모아 설치하고, 설치된 모든 코딩 CLI(.claude·.codex·.gemini·opencode 등)에 자동으로 심링크·MCP 연결하는 복사-붙여넣기 프롬프트. 이미 있으면 최신으로 업데이트한다."
summary_en: "One paste-and-go prompt that installs a curated skill set, a shared system prompt, CLI tools (rtk, playwright-cli) and the codebase-memory MCP into a single ~/.agents/ dir, then wires it into every coding CLI you have — updating anything already there."
tags: [onboarding, install, skills, system-prompt, symlink, agents-dir, dotfiles, mcp, cli-tools]
author: cskwork
order: 5
use_case: "새 머신을 세팅하거나 여러 코딩 CLI의 스킬·규칙을 한곳에서 관리하고 싶을 때. 에이전트 채팅창에 그대로 붙여넣으면 끝."
---

## 한 줄

추천 스킬 묶음과 공통 시스템 프롬프트를 `~/.agents/` **한 폴더**에 모으고, 설치된 모든 코딩 CLI에
심링크(symlink, 한 파일을 여러 위치에서 가리키게 하는 바로가기)로 연결하는 단일 설치 프롬프트.

## 무엇이 설치되나 (한눈에)

이 프롬프트 하나가 설치하는 전부. 스킬은 `~/.agents/skills/`에, CLI 바이너리·MCP는 각 에이전트에 전역으로 연결된다.

| 이름 | 종류 | 소스 | 무엇을 더해주나 |
|---|---|---|---|
| AGENTS.md | 공통 규칙 | cskwork/coding-agent-rules | 모든 CLI가 공유하는 시스템 프롬프트(코딩 규칙) |
| grill-with-docs | 스킬 | mattpocock/skills | 최신 문서로 코드를 캐물어 검증 |
| improve-codebase-architecture | 스킬 | mattpocock/skills | 코드베이스 구조 개선 가이드 |
| triage | 스킬 | mattpocock/skills | 이슈·작업 분류와 우선순위 |
| writing-great-skills | 스킬 | mattpocock/skills | 스킬 작성·개선 레퍼런스 |
| ssh-llm-connect | 스킬 | cskwork/ssh-llm-connect | 에이전트용 안전한 SSH 가드 |
| claude-code-workflow-cheatsheet | 스킬 | cskwork/claude-code-workflow-cheatsheet | Claude Code 워크플로 치트시트 |
| jk (Jenkins CLI) | 스킬 + CLI | avivsinai/jenkins-cli | 에이전트가 Jenkins를 조작 |
| autoresearch | 스킬/플러그인 | uditgoenka/autoresearch | 자율 리서치 루프 |
| call-agent | 스킬 | cskwork/call-agent | codex·agy·kiro·claude·notebooklm로 위임 라우팅 |
| supergoal | 스킬(전체 레포) | cskwork/supergoal-skill | 베이스라인 우선 목표→검증 전달 |
| superpm | 스킬(전체 레포) | cskwork/superpm-skill | PM 산출물(PRD·전략·OKR 등) |
| superdesign | 스킬(전체 레포) | cskwork/superdesign-skill | UI/UX 디자인 라우팅 |
| superoffice | 스킬(전체 레포) | cskwork/superoffice-skills | 한국형 업무 문서 생성 |
| superhacker | 스킬(전체 레포) | cskwork/superhacker-skill | 인가된 보안 테스트·CTF·학습 |
| **rtk** | CLI 토큰 프록시 (기본) | rtk-ai/rtk | 일반 개발 명령 토큰 60-90% 절감, 에이전트별 `rtk init` |
| **playwright-cli** | CLI (기본) | microsoft/playwright-cli | 토큰 효율적 브라우저 자동화(코드 생성·셀렉터·스크린샷) |
| **codebase-memory-mcp** | MCP 서버 (전역) | DeusData/codebase-memory-mcp | 코드베이스를 지식 그래프로 인덱싱, 토큰 ~99% 절감 |
| supertonic-tts | CLI (선택) | supertonic-tts (npm) | 로컬 TTS(음성 합성) |
| figma-cli | CLI (선택) | figma-ds-cli (npm) | Figma 디자인 시스템 조작 |

> 굵게 표시된 rtk·playwright-cli·codebase-memory-mcp는 이번에 기본 설치로 추가됐다. `skill-creator`는 기본 묶음에서 제외됐다.

## 언제 쓰는가

- 새 노트북·서버를 세팅하면서 자주 쓰는 스킬을 한 번에 깔고 싶을 때
- Claude Code·Codex·Gemini CLI·OpenCode를 섞어 쓰는데, 규칙(시스템 프롬프트)과 스킬을
  도구마다 따로 복사하기 싫을 때 — `~/.agents/` 하나만 고치면 전부 따라온다

## 무엇을 하는가

1. `~/.agents/`를 단일 출처로 만든다 — `AGENTS.md`(공통 규칙) + `skills/`(스킬 모음).
2. 추천 스킬과 CLI 바이너리(rtk·playwright-cli, 선택: supertonic-tts·figma-cli)를 각 소스에서 받아 설치한다. **이미 있으면 최신으로 업데이트.**
3. 설치된 CLI를 감지해 각 도구의 규칙 파일·스킬 폴더를 `~/.agents/`로 심링크한다.
4. 공용 도구를 연결한다 — rtk 토큰 프록시를 에이전트별로 `rtk init`, codebase-memory-mcp를 전역 MCP로 자동 구성.

## 함정

- **심링크 권한 + 파일/폴더 구분 (Windows 핵심 함정)**: 심볼릭 링크는 개발자 모드(Developer Mode)나
  관리자 권한이 필요하다. 없으면 자동 폴백하는데 — **파일은 하드링크(hardlink)**, **폴더(skills)는
  정션(junction)** 으로 갈라야 한다. `mklink /H`(하드링크)는 **폴더에 안 통한다** — skills 링크가
  실패하는 흔한 원인. macOS·Linux는 `ln -s` 하나로 파일·폴더 모두 처리된다.
- **링크 실패 시 원본이 비지 않게**: 프롬프트는 *링크를 먼저 만들고 성공한 뒤에만* 원본을 `.bak`으로
  옮긴다. 혹시 이전 버전으로 이미 원본이 `<파일>.bak-<시각>`에 들어가고 위치가 비었다면, 그 `.bak`을
  원래 이름으로 되돌리면 복구된다 (예: `mv ~/.codex/AGENTS.md.bak-* ~/.codex/AGENTS.md`).
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
- **rtk·codebase-memory-mcp는 별도 바이너리**: rtk는 `brew`나 `cargo`(Rust)로, codebase-memory-mcp는
  원격 설치 스크립트(`curl … | bash` / `install.ps1`)로 깔린다. 그 스크립트가 감지된 모든 에이전트의 MCP 설정을
  자동으로 손대므로, 실행 전 무엇이 바뀌는지 보고 싶으면 `--skip-config`로 바이너리만 받은 뒤 수동 등록해도 된다.

아래 프롬프트를 에이전트 채팅창에 그대로 붙여넣으세요.

```text
You are setting up my global AI coding-agent environment. Build ONE shared source of truth at ~/.agents/ and symlink it into every coding CLI I already have installed.

Rules:
- Be idempotent. If something already exists, UPDATE it to the latest instead of duplicating. If a path is
  already a link into ~/.agents, leave it.
- NEVER leave a config path empty. Put the new link in place BEFORE removing the original, and only ever back
  up a REAL file/dir, never a link. Safe order PER target:
    1. Confirm the ~/.agents source (file or dir) exists. If not, skip this target and say so -- do NOT touch the original.
    2. Create the link at a temp name beside the target (e.g. <path>.newlink).
    3. If link creation FAILED: delete the temp, leave the original untouched, report the exact error, move on.
       (Never reach step 4 on failure -- this is what caused empty config paths before.)
    4. Only now: if the original is a real file/dir, move it to <path>.bak-<timestamp>; then rename <path>.newlink to <path>.
  If any path ever ends up empty, restore it from its <path>.bak-* immediately.
- Resolve ~ to my home dir on the current OS, and pick the link type by TARGET TYPE (file vs directory):
    macOS/Linux: ln -s            (works for both files and directories, no elevation)
    Windows, a FILE:      New-Item -ItemType SymbolicLink (needs Developer Mode or admin). If denied,
                          fall back to New-Item -ItemType HardLink (same drive only, no elevation).
    Windows, a DIRECTORY: New-Item -ItemType SymbolicLink (needs Developer Mode or admin). If denied,
                          fall back to New-Item -ItemType Junction (no elevation). NEVER hardlink a directory --
                          mklink /H / hardlinks do not work on folders (this is why the skills links failed).
    If a fallback cannot apply (e.g. ~/.agents is on a different drive, so a junction/hardlink cannot span
    volumes), COPY instead and tell me it will not auto-update.
- Do not commit or push anything. Print a summary of created / updated / skipped / backed-up / restored at the end.

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
     writing-great-skills           github.com/mattpocock/skills  -> skills/productivity/writing-great-skills   (reference for authoring/improving any skill)
     ssh-llm-connect                github.com/cskwork/ssh-llm-connect        (copy its SKILL.md; run install.sh per project when you need the SSH guard)
     claude-code-workflow-cheatsheet github.com/cskwork/claude-code-workflow-cheatsheet
     jk (Jenkins CLI)               github.com/avivsinai/jenkins-cli          (install the jk binary per its README, then add a SKILL.md so agents can drive it)
     autoresearch                   github.com/uditgoenka/autoresearch        (install per its README; it is a plugin/skill)
     call-agent                     github.com/cskwork/call-agent             (delegation skill -> routes to codex/agy/kiro/claude/notebooklm; copy its skills/call-agent folder, NOT its install.sh -- the symlink step below links it)
   These are whole-repo skills (SKILL.md plus agents/ reference/ templates/) -- copy the ENTIRE repo into ~/.agents/skills/<name>/, not just SKILL.md:
     supergoal                      github.com/cskwork/supergoal-skill
     superpm                        github.com/cskwork/superpm-skill
     superdesign                    github.com/cskwork/superdesign-skill
     superoffice                    github.com/cskwork/superoffice-skills
     superhacker                    github.com/cskwork/superhacker-skill      (authorized security testing / CTF / learning only)

   Command-line tools in the kit (install the binary; no skill folder needed):
     rtk              Rust Token Killer -- a CLI proxy that cuts 60-90% of tokens on common dev commands.
                      Install: brew install rtk (macOS/Linux) OR cargo install --git https://github.com/rtk-ai/rtk (any OS with Rust).
                      It gets wired into each agent in step 4 via rtk init.
     playwright-cli   npm i -g @playwright/cli@latest    (github.com/microsoft/playwright-cli -- token-efficient Playwright browser
                      automation for agents: record/generate code, inspect selectors, take screenshots)

   Optional CLI tools (install only if you want them):
     supertonic-tts   npm i -g supertonic-tts    (local text-to-speech CLI)
     figma-cli        npm i -g figma-ds-cli       (Figma design-system CLI; add a SKILL.md wrapper so agents can drive it -> skills/figma-cli)

   Treat writing-great-skills as the authoring reference: whenever you create or improve a SKILL.md
   in ~/.agents/skills/, consult it first.

3. Symlink ~/.agents into every coding CLI I have
   Detect which are installed (config dir present or binary on PATH; use each tool's OS-correct
   config path). For each present tool, replace its global rules file with a symlink to
   ~/.agents/AGENTS.md -- the link NAME differs per tool (CLAUDE.md / AGENTS.md / GEMINI.md) but
   all point at the one file -- and where the tool has a global skills dir, link it to
   ~/.agents/skills (a DIRECTORY: on Windows that means a junction, never a hardlink). Use the safe
   link-before-backup order from the Rules above. Current (2026) per-tool paths:
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

4. Enable shared agent tooling on the tools you detected in step 3
   a. rtk token proxy -- for each installed agent, run its rtk init so common dev/bash commands auto-rewrite to
      rtk and cut 60-90% of tokens (the rtk binary was installed in step 2):
        rtk init -g                    Claude Code (default)
        rtk init -g --agent cursor     Cursor
        rtk init -g --agent windsurf   Windsurf
        rtk init --agent cline         Cline / Roo Code
      rtk covers 14+ agents -- run rtk init --help to match each tool you have; skip any it does not support.
   b. codebase-memory-mcp -- a global MCP server that indexes your codebase into a persistent knowledge graph
      (158 languages, sub-millisecond queries, ~99% fewer tokens than reading files one by one). Install it once;
      its installer AUTO-DETECTS and configures the MCP for every agent you have (Claude Code, Codex, Gemini, and more):
        macOS/Linux:  curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash
        Windows:      iwr -Uri https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 -OutFile install.ps1; ./install.ps1
      If the auto-config misses a tool, add it to that tool's MCP config by hand (e.g. ~/.claude/.mcp.json):
        "codebase-memory-mcp": { "command": "<path-to-installed-binary>", "args": [] }

5. Verify
   List ~/.agents/skills/, confirm every symlink resolves to ~/.agents, confirm rtk init ran for each agent and
   codebase-memory-mcp appears in each tool's MCP list, then print the created / updated / skipped / backed-up summary.
```
