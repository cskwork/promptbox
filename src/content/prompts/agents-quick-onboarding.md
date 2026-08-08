---
title: 코딩 에이전트 온보딩 한 방 설치
title_en: One-shot coding agent setup
summary: "스킬 57종과 공통 시스템 프롬프트, CLI 도구(officecli·herdr·rtk)와 에이전트용 브라우저(ego lite, macOS)를 ~/.agents/ 한곳에 모아 설치하고, 설치된 모든 코딩 CLI(Claude Code·Codex·Jcode·Pi·Gemini·Cursor·Kiro·OpenCode)에 자동으로 연결·MCP 구성하는 복사-붙여넣기 프롬프트. 이미 있으면 그대로 두고, 빠졌거나 깨진 항목만 복구한다."
summary_en: "One paste-and-go prompt that installs shared skills, instructions, CLI tools, and the ego lite browser into ~/.agents/, then safely wires only the missing pieces into Claude Code, Codex, Jcode, Pi, Gemini, Cursor, Kiro, and OpenCode without replacing user-owned work."
tags: [onboarding, install, skills, system-prompt, symlink, agents-dir, dotfiles, mcp, cli-tools, idempotent, jcode, pi, rtk, token-savings]
author: cskwork
order: 5
use_case: "새 머신을 세팅하거나 여러 코딩 CLI의 스킬·규칙을 한곳에서 관리하고 싶을 때. 에이전트 채팅창에 그대로 붙여넣으면 끝. 이미 설치된 환경이 깨졌을 때 복구용으로도 그대로 쓴다."
use_case_en: "Set up a new machine, manage shared skills and rules across coding CLIs, or repair an existing installation by pasting one prompt into your agent."
---

## 한 줄

스킬 묶음과 공통 시스템 프롬프트를 `~/.agents/` **한 폴더**에 모으고, 설치된 모든 코딩 CLI에
심링크(symlink, 한 파일을 여러 위치에서 가리키게 하는 바로가기)로 연결하는 단일 설치 프롬프트.
**멱등**이라 몇 번을 돌려도 안전하고, 두 번째 실행은 복구 도구가 된다.

## 무엇이 설치되나 (한눈에)

스킬은 `~/.agents/skills/`에 심링크로 놓이고, 원본은 `~/.agents/sources/<owner>/<repo>`에 클론된다.
`git pull` 한 번이면 설치된 스킬이 전부 최신이 되는 구조다.

| 이름 | 종류 | 소스 | 무엇을 더해주나 |
|---|---|---|---|
| AGENTS.md | 공통 규칙 | 프롬프트 내장 운영 지침 | 모든 CLI가 공유하는 시스템 프롬프트 |
| **Matt Pocock Skills** (정식 29종 + 베타 6종) | 스킬 | mattpocock/skills | `ask-matt`(설계·디버깅·트레이드오프 판단), `tdd`, `triage`, `code-review`, `research`, `prototype`, `implement`, `to-spec`, `to-tickets`, `wayfinder`, `wizard` 등 |
| context-diet | 스킬 | cskwork/context-diet-skill | 시스템 프롬프트 비대화 측정·감축 |
| autoresearch | 스킬 | uditgoenka/autoresearch | 자율 리서치 루프 |
| call-agent | 스킬 | cskwork/call-agent | codex·agy·kiro·claude·notebooklm로 위임 라우팅 |
| archify | 스킬 | tt-a1i/archify | 아키텍처·시퀀스·데이터플로 다이어그램을 단일 HTML로 |
| hallmark | 스킬 | Nutlope/hallmark | AI 티 안 나는 UI 디자인·감사·리디자인 |
| gpt-image-2 | 스킬 | agentspace-so/agent-skills | ChatGPT 구독으로 이미지 생성(별도 과금 없음) |
| clean-code | 스킬 | cskwork/clean-code | 동작을 바꾸지 않고 레거시 코드 리팩터링 — 특성화 테스트로 현재 동작을 먼저 고정하고 작은 배치로 편집 |
| debug-code | 스킬 | cskwork/promptbox (skills/debug-code) | 증거 기반 디버깅 — 가장 먼저 깨진 invariant(불변 조건)를 찾고 최소 안전 패치. 프로덕션 전용·간헐적·성능·레거시 버그에 강함 |
| **ego-browser** | 스킬 + 브라우저 앱 | citrolabs/ego-lite | 내 로그인 상태를 그대로 쓰는 에이전트용 브라우저(QA·웹 자동화). **macOS 전용**이며, Windows·Linux에서는 필요 시 Playwright 사용 |
| **officecli** (11종) | 스킬 + CLI | iOfficeAI/OfficeCLI | docx·xlsx·pptx 생성·분석, 재무모델·피치덱·논문 레이어 |
| **herdr** | 스킬 + CLI | ogulcancelik/herdr | 코딩 에이전트용 터미널 멀티플렉서 |
| **rtk** | CLI + 훅 | rtk-ai/rtk | 셸 명령 출력을 압축해 컨텍스트로 들어가는 토큰을 줄인다(git·pytest·docker 등 100종+). MCP가 아니라 `PreToolUse` 훅으로 붙는다 |

> 설치된 CLI 수를 고정하지 않는다. 각 도구가 `~/.agents/skills`를 직접 읽는지 먼저 확인하고, 필요한 어댑터만 만든다.

## 언제 쓰는가

- 새 노트북·서버를 세팅하면서 자주 쓰는 스킬을 한 번에 깔고 싶을 때
- Claude Code·Codex·Jcode·Pi·Gemini CLI·Cursor·Kiro·OpenCode를 섞어 쓰는데, 규칙과 스킬을
  도구마다 따로 복사하기 싫을 때 — `~/.agents/` 하나만 고치면 전부 따라온다
- **환경이 깨졌을 때** — 에이전트가 "그 스킬 없다"고 하면 그대로 다시 돌린다

## 무엇을 하는가

1. 손대기 전에 **현재 상태를 전부 기록**한다 (`inventory.tsv`) — 이게 없으면 나중에 복구할 수 없다.
2. `~/.agents/`를 단일 출처로 만든다 — `AGENTS.md`(공통 규칙) + `skills/`(심링크) + `sources/`(클론).
3. 상류 레포를 클론하고, 각 스킬을 `~/.agents/skills/<name>`으로 심링크한다. **이미 있으면 업데이트, 깨졌으면 복구.**
4. 설치된 CLI를 감지해 각 도구의 규칙 파일·스킬 폴더를 `~/.agents/`로 심링크한다.
5. CLI 바이너리와 MCP 서버를 설치하고, **실제 핸드셰이크로 응답을 확인**한다. `rtk`도 여기서 깔고
   `rtk init -g`로 각 에이전트에 훅을 붙인다.
6. 코드베이스 인덱서 MCP(codebase-memory-mcp 등)를 **찾아서 목록만 보여주고, 사용자가 승인하면** 제거한다.
7. 읽기 전용 감사 스크립트를 남긴다 — 나중에 깨졌는지 확인하는 용도.

## 함정

전부 실제로 터진 것들이다. 프롬프트에 각각 방어 조항이 들어 있다.

- **디렉터리가 있다고 설치된 게 아니다 (이번 최대 함정)**: 중간에 죽은 설치기는 **이름만 맞는 빈 폴더**를
  남긴다. 에이전트는 "스킬 없음"이라 하는데 `ls`에는 보이는 상태가 된다. 실제로 심링크 43개가 이렇게
  날아갔다. 판정은 반드시 `SKILL.md`가 **읽히는지**로 해야 하고 `[ -d ... ]`는 쓰면 안 된다.
- **`git pull` 한 번에 스킬이 조용히 사라진다 (재설치보다 위험)**: 상류 레포가 루트에 있던 `SKILL.md`를
  표준 레이아웃인 `skills/<이름>/`으로 옮기면, 링크는 멀쩡하고 폴더도 그대로라 `ls`로는 아무 이상이
  없는데 스킬만 증발한다. 2026-08-07 실행에서 `context-diet`·`clean-code`·`herdr` 세 개가 한 번의
  갱신으로 이렇게 죽었다. **pull 뒤에는 반드시 링크 너머의 `SKILL.md`를 다시 확인하고**, 없으면 소스
  안에서 찾아 재타겟해야 한다. 위의 "빈 폴더" 함정과 증상이 같지만 원인은 *성공한* 업데이트다.
- **rtk가 공용 지시문 파일을 건드린다**: `rtk init -g`는 `~/.claude/CLAUDE.md`에 `@RTK.md` 한 줄을
  덧붙인다. 그런데 7단계에서 그 경로는 **정본 `~/.agents/AGENTS.md`로 가는 심링크**라, Claude 전용
  한 줄이 Codex·Jcode·Pi·Gemini·OpenCode·Kiro가 함께 읽는 파일에 박힌다. 그 에이전트들에는 `RTK.md`가
  없어 매 세션이 깨진 include로 시작한다. rtk는 7단계 **전에** 돌리고, 끝난 뒤 정본이 규정된 내용
  그대로인지 다시 확인한다. 훅은 `settings.json`에 있으므로 그 줄을 지워도 rtk는 정상 동작한다.
- **폴더 이름이 달라도 스킬 이름은 겹칠 수 있다**: 판정 기준은 폴더명이 아니라 `SKILL.md`의 `name:`이다.
  `debug-code`와 `debug-code-skill`처럼 이름이 다른 두 폴더가 같은 `name: debug-code`를 선언하면 둘 중
  하나만 로드되고, 어느 쪽이 이길지는 알 수 없다. 지우지 말고 한쪽을 `skills-bak`으로 아카이브한다.
- **검증 스크립트가 거짓말을 한다 (zsh 카운터)**: zsh/bash에서 `local n=0` 뒤에 `n+=1`은 덧셈이 아니라
  **문자열 이어붙이기**다. 그래서 "엔트리 1111111111111111111개" 같은 수치가 나오는데 나머지 줄은
  멀쩡해 보인다. 카운터는 `local -i n=0`으로 선언한다.
- **감사 실패 조건을 넓게 잡으면 신호가 죽는다**: 스킬 폴더에는 스킬이 아닌 것(개인 메모, 도구가 관리하는
  번들)도 산다. 이걸 손상으로 세면 매번 "DAMAGE FOUND"가 뜨고, 두세 번 지나면 아무도 안 본다. 실패
  판정은 **빈 폴더와 깨진 링크 0** 두 가지로만 하고 나머지는 사람이 읽을 경고로 남긴다.
- **상류 설치 스크립트가 `rm -rf`를 한다**: `mattpocock/skills/scripts/link-skills.sh`는 dev 전용이라
  기존 실디렉터리를 지운다. 설치기는 실행 전에 읽고, 파괴적이면 백업 방식으로 다시 구현한다.
- **MCP 설치기가 에이전트 설정도 바꾼다**: MCP 설치 스크립트는 감지한 코딩 에이전트의
  MCP 설정·지침·스킬·훅까지 구성할 수 있다. 실행 전에 설치 스크립트를 읽고, 자동 설정이 불필요하면
  바이너리만 설치한 뒤 기존 설정 규칙에 맞춰 수동 등록한다.
- **MCP `cwd` 하드코딩**: 설치기가 실행된 디렉터리를 전역 설정에 박아버린다. 지워야 어느 프로젝트에서든
  올바르게 동작한다.
- **사용자 소유 심링크가 같이 날아간다**: `~/.agents` 밖 개인 레포를 가리키는 링크는 복구 대상에서
  누락되기 쉽다. 그래서 손대기 전 인벤토리가 필수다.
- **버전 매니저가 비대화형 셸에서 안 깨어난다**: `node`가 nvm shim으로 잡혀 `command not found: _load_nvm`이
  나는데 `/opt/homebrew/bin/node`는 멀쩡하다. 인터프리터는 절대경로로 고정한다.
- **자기 안에서 도는 도구는 자기를 업데이트 못 한다**: herdr 세션 안에서 `herdr update`를 하면 다운로드만
  되고 교체가 막힌다. 우회하지 말고 사용자에게 명령을 넘긴다.
- **브라우저는 에이전트가 끝까지 못 깐다 (ego lite)**: DMG 설치까지는 스크립트로 되지만, `ego-browser`
  명령을 `~/.local/bin`에 등록하는 건 앱 **첫 실행 GUI 온보딩**이다. 사람이 끝내기 전에는 "설치됨"이
  아니고, Chrome 데이터 이관 여부는 에이전트가 대신 답하면 안 된다. 그래서 프롬프트는 5b에서 멈추고
  기다린다. macOS 전용이라 Windows·Linux에서는 ego lite만 `SKIPPED-UNSUPPORTED`로 기록한다.
  브라우저 자동화가 필요하면 해당 플랫폼에서 Playwright를 설치해도 된다.
- **이전 설정의 형제 파일이 남는다**: 지시문 정본을 바꿔도 `~/.kiro/steering/`에 남은 옛 파일이 같이
  로드된다. 디렉터리를 훑어 잔재를 정리해야 한다.
- **심링크 권한 + 파일/폴더 구분 (Windows 핵심 함정)**: 심볼릭 링크는 개발자 모드나 관리자 권한이 필요하다.
  없으면 **파일은 하드링크**, **폴더(skills)는 정션(junction)** 으로 갈라야 한다. `mklink /H`는 폴더에
  안 통한다. macOS·Linux는 `ln -s` 하나로 둘 다 된다.
- **검증 스크립트가 상태를 바꾸면 안 된다**: 인자를 무시하는 스크립트에 `--dry-run`을 넘기면 점검이 아니라
  실행이 된다. 감사는 반드시 별도의 읽기 전용 스크립트로 한다.
- **rtk와 코드 인덱서 MCP는 목적이 겹친다**: rtk는 셸 출력을 압축해 토큰을 줄이는데, 코드베이스
  인덱서 MCP(codebase-memory-mcp 등)는 반대로 상시 도구 스키마와 인덱스 응답으로 컨텍스트를 채운다.
  그래서 프롬프트는 인덱서 MCP를 **찾아서 목록만 보여주고 제거는 사용자 승인을 받은 뒤** 실행한다.
  승인 없이는 아무것도 지우지 않고 `PENDING-USER`로 남긴다. 제거는 설정에서 항목을 떼어내기 전
  타임스탬프 백업을 먼저 뜬다.
  다만 **이름만 보고 찾으면 오탐이 난다**. `~/.claude/settings.json`의 `"mcp__serena"`는 서버 등록이
  아니라 context-diet가 그 서버를 **차단**해 둔 규칙이라, 지우면 사용자가 꺼둔 걸 다시 켜는 셈이 된다.
  주석 처리된 블록과 `enabled: false` 항목도 등록이 아니다. `mcpServers`/`[mcp_servers.*]` 아래
  살아있는 등록인지 확인한 것만 목록에 올린다.

아래 프롬프트를 에이전트 채팅창에 그대로 붙여넣으세요.

<div class="copy-cta">
  <div class="copy-cta__row">
    <div>
      <div class="copy-cta__title"><span data-lang="en">Copy the full prompt</span><span data-lang="ko">프롬프트 전문 복사</span></div>
      <div class="copy-cta__sub"><span data-lang="en">Copies only the code block below (the prompt itself, without the notes) — no dragging needed.</span><span data-lang="ko">아래 코드블록(설명 제외, 프롬프트 본문만)을 통째로 클립보드에 담습니다. 드래그할 필요 없습니다.</span></div>
    </div>
    <button type="button" class="btn btn-primary pc-copy copy-cta__btn" data-target="#pc-mainblock" aria-label="Copy the full prompt" data-aria-en="Copy the full prompt" data-aria-ko="프롬프트 전문 복사">
      <svg class="pc-ico-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      <svg class="pc-ico-check hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
      <span class="pc-copy-label"><span data-lang="en">Copy prompt</span><span data-lang="ko">프롬프트 복사</span></span>
    </button>
  </div>
</div>

```text
Set up and maintain a global coding-agent environment on native macOS or Windows PowerShell.
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
the symlink still resolves, the directory still exists, and `ls` looks perfectly healthy — but
SKILL.md is gone and the skill has silently disappeared from every agent. This is the same
"directory is not evidence" failure as an interrupted installer, except a successful `git pull`
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

**Stance** — Domain data first: get the domain model and real data shapes right before code or tests — tests verify the model, they never define it. Make the smallest verified, maintainable change. Make maintainable code; no unrelated refactoring. Prefer reversible choices. Ask only about consequential data loss, public API, security, or migration decisions; otherwise state assumptions and proceed. Never claim what you did not verify. Do not create a Git worktree by default.

**1. Orient** — Read repo instructions, the domain model and real data shapes, then relevant tests/contracts, and the closest analogous code. Open `ask-matt` to select the right skill. Map entry points, callers, dependencies, side effects, and real verification commands. Batch independent reads.

**2. Delegate** — As an orchestrator use subagents for plan, review, execute, and verify tasks. As soon as the question is framed, fan out fresh-context subagents. Each gets a narrow brief: goal, candidate paths, constraints, expected output. Use Luna with max reasoning or Opus with medium reasoning for subagents, depending on the harness.
Skip delegation only when you already know the exact file and symbol, or the change is a single trivial edit.

**3. Plan** — State: `task type · goal · files · contracts · verification · assumptions`.

After stating the plan, run a `grilling` session (using `domain-modeling`, producing ADRs/glossary) to interview the user until their intent is clearly understood and confirmed. Do not start implementation before this confirmation. Skip the grilling for trivial or unambiguous changes — state assumptions and proceed.

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

Targets include Claude `~/.claude/CLAUDE.md`, Codex `~/.codex/AGENTS.md`, Jcode `~/AGENTS.md`,
Pi `~/.pi/agent/AGENTS.md`, Gemini `~/.gemini/GEMINI.md`, OpenCode instructions, and Kiro steering.
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
and Pi versions load `~/.agents/skills` natively. For them, verify that behavior and preserve existing
`~/.jcode/skills`, `~/.pi/skills`, and `~/.pi/agent/skills` directories in place; they may contain
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

If you write the audit in zsh or bash, declare counters with `local -i n=0`. A plain `local n=0`
followed by `n+=1` performs STRING CONCATENATION, so the script reports counts like
"1111111111111111111" or a garbage negative number while every other line looks correct — a
verification script that lies is worse than none.

Also verify:
  - The canonical ask-matt SKILL.md does not contain 'disable-model-invocation: true', and every
    installed ask-matt link resolves to that same file.
  - Every CLI responds to --version / --help.
  - Every MCP server passes the handshake probe from step 6.3.
  - Instruction-file checksums are identical across all documented agent paths, including Jcode's
    `~/AGENTS.md` and Pi's `~/.pi/agent/AGENTS.md`.
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
done. Do not commit or push anything.
```
