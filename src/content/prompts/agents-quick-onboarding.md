---
title: 코딩 에이전트 온보딩 한 방 설치
title_en: One-shot coding agent setup
summary: "스킬 57종과 공통 시스템 프롬프트, CLI 도구(codebase-memory-mcp·officecli·herdr)와 에이전트용 브라우저(ego lite, macOS)를 ~/.agents/ 한곳에 모아 설치하고, 설치된 모든 코딩 CLI(Claude Code·Codex·Jcode·Pi·Gemini·Cursor·Kiro·OpenCode)에 자동으로 연결·MCP 구성하는 복사-붙여넣기 프롬프트. 이미 있으면 그대로 두고, 빠졌거나 깨진 항목만 복구한다."
summary_en: "One paste-and-go prompt that installs shared skills, instructions, CLI tools, and the ego lite browser into ~/.agents/, then safely wires only the missing pieces into Claude Code, Codex, Jcode, Pi, Gemini, Cursor, Kiro, and OpenCode without replacing user-owned work."
tags: [onboarding, install, skills, system-prompt, symlink, agents-dir, dotfiles, mcp, cli-tools, idempotent, jcode, pi]
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
| **codebase-memory-mcp** | CLI + MCP | DeusData/codebase-memory-mcp | 코드를 로컬 지식 그래프로 인덱싱, 구조 탐색·호출 추적·영향 분석을 토큰 효율적으로 |
| **officecli** (11종) | 스킬 + CLI | iOfficeAI/OfficeCLI | docx·xlsx·pptx 생성·분석, 재무모델·피치덱·논문 레이어 |
| **herdr** | 스킬 + CLI | ogulcancelik/herdr | 코딩 에이전트용 터미널 멀티플렉서 |

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
5. CLI 바이너리와 MCP 서버를 설치하고, **실제 핸드셰이크로 응답을 확인**한다.
6. 읽기 전용 감사 스크립트를 남긴다 — 나중에 깨졌는지 확인하는 용도.

## 함정

전부 실제로 터진 것들이다. 프롬프트에 각각 방어 조항이 들어 있다.

- **디렉터리가 있다고 설치된 게 아니다 (이번 최대 함정)**: 중간에 죽은 설치기는 **이름만 맞는 빈 폴더**를
  남긴다. 에이전트는 "스킬 없음"이라 하는데 `ls`에는 보이는 상태가 된다. 실제로 심링크 43개가 이렇게
  날아갔다. 판정은 반드시 `SKILL.md`가 **읽히는지**로 해야 하고 `[ -d ... ]`는 쓰면 안 된다.
- **상류 설치 스크립트가 `rm -rf`를 한다**: `mattpocock/skills/scripts/link-skills.sh`는 dev 전용이라
  기존 실디렉터리를 지운다. 설치기는 실행 전에 읽고, 파괴적이면 백업 방식으로 다시 구현한다.
- **MCP 설치기가 에이전트 설정도 바꾼다**: `codebase-memory-mcp` 설치기는 감지한 코딩 에이전트의
  MCP 설정·지침·스킬·훅까지 구성할 수 있다. 실행 전에 설치 스크립트를 읽고, 자동 설정이 불필요하면
  `--skip-config`로 바이너리만 설치한 뒤 기존 설정 규칙에 맞춰 수동 등록한다.
- **자동 인덱싱 범위가 너무 크다**: 상위 폴더나 생성물까지 백그라운드에서 읽으면 최초 인덱싱이
  오래 걸리고 메모리를 많이 쓸 수 있다. v0.9.0 이상인지 확인하고, 프로젝트마다 `.cbmignore`를
  먼저 만든 뒤 `auto_index_limit=50000`, `auto_watch=true`, `auto_index=true` 순서로 설정한다.
  이렇게 하면 최초 자동 인덱싱 후에도 watcher(변경 감시)가 코드 변경을 그래프에 증분 반영한다.
- **MCP `cwd` 하드코딩**: 설치기가 실행된 디렉터리를 전역 설정에 박아버린다. 지워야 어느 프로젝트에서든
  올바른 그래프를 본다.
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
                                      files (production-access.md, bug-patterns.md) embedded in the promptbox
                                      .md body; materialise them into ~/.agents/skills/debug-code/ with the
                                      SKILL.md frontmatter (name: debug-code) and a references/ subfolder.
  Codebase Memory MCP (CLI + MCP)     https://github.com/DeusData/codebase-memory-mcp
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
directory name, and fail loudly on a collision instead of silently overwriting.

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

  Codebase Memory MCP
    macOS/Linux: curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash
    Windows: download and inspect install.ps1 from the repository, then run it in PowerShell
    Require v0.9.0 or newer before enabling automatic indexing.
    Before restarting any agent, create a reviewed .cbmignore in every active repository root.
    Then run, in this order:
      codebase-memory-mcp config set auto_index_limit 50000
      codebase-memory-mcp config set auto_watch true
      codebase-memory-mcp config set auto_index true
      codebase-memory-mcp config list
  OfficeCLI           brew install officecli
  Herdr               official installer, or 'herdr update'

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

 0. Make Codebase Memory MCP the default code-intelligence server in every detected agent harness.
    If code-review-graph is also registered, remove only its MCP config entry after backing up the
    config file. Do not uninstall its binary or delete its indexes unless I explicitly ask.
 1. Set 'command' to the ABSOLUTE PATH OF THE BINARY YOU ACTUALLY INSTALLED. Installers routinely
    guess the wrong runner (writing 'uvx' for a pipx install), which makes the client download the
    package on every cold start and time out during handshake. This presents as "loading forever",
    not as an error.
 2. Remove any 'cwd' the installer hardcoded. A global config must not pin to whatever directory
    setup happened to run in.
 3. VALIDATE WITH A REAL HANDSHAKE BEFORE DECLARING SUCCESS: drive the server over stdio with
    initialize -> notifications/initialized -> tools/list, and report the measured time and tool
    count. A server that starts is not the same as a server that answers.
 4. If the tool supports a multi-repo registry, register each built graph so the tools work from a
    parent directory as well as from inside each repo.

=== 7. GLOBAL INSTRUCTION FILES ===

Replace every detected agent's global instruction file with the following content, from
"# Operating Instructions" through the end of the "7. Report" paragraph:

# Operating Instructions

**Stance** — Domain data first: get the domain model and real data shapes right before code or tests — tests verify the model, they never define it. Make the smallest verified, maintainable change. Make maintainable code; no unrelated refactoring. Prefer reversible choices. Ask only about consequential data loss, public API, security, or migration decisions; otherwise state assumptions and proceed. Never claim what you did not verify. Do not create a Git worktree by default.

**1. Orient** — Read repo instructions, the domain model and real data shapes, then relevant tests/contracts, and the closest analogous code. Open `ask-matt` to select the right skill. Map entry points, callers, dependencies, side effects, and real verification commands. Batch independent reads.

**2. Delegate** — As an orchestrator use subagents for plan, review, execute, and verify tasks. As soon as the question is framed, fan out fresh-context subagents. Each gets a narrow brief: goal, candidate paths, constraints, expected output.
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

Never create duplicate repositories, nested copies, or alternate names such as skill-2 or
skill.bak-<date>. If prior runs left such duplicates, ARCHIVE them to
~/.agents/skills-bak/<timestamp>/ — do not delete, and do not leave them in place where they load
as separate skills and bloat every agent's context.

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

=== 9. VERIFICATION ===

Produce a SEPARATE, READ-ONLY audit script (~/.agents/work/audit-skills.sh) that mutates nothing and
classifies every entry: symlink-with-SKILL.md, realdir-with-SKILL.md, broken link, empty directory,
missing SKILL.md. Run it and report the counts.
EMPTY DIRECTORIES AND BROKEN LINKS MUST BOTH BE ZERO.

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
