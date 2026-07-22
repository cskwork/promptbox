---
title: 코딩 에이전트 온보딩 한 방 설치
summary: "스킬 62종과 공통 시스템 프롬프트, CLI 도구(code-review-graph·officecli·herdr)를 ~/.agents/ 한곳에 모아 설치하고, 설치된 모든 코딩 CLI(.claude·.codex·.gemini·.cursor·.kiro·opencode)에 자동으로 심링크·MCP 연결하는 복사-붙여넣기 프롬프트. 이미 있으면 최신으로 업데이트하고, 깨진 링크는 복구한다."
summary_en: "One paste-and-go prompt that installs 62 skills, a shared system prompt, and CLI tools (code-review-graph, officecli, herdr) into a single ~/.agents/ dir, then wires it into every coding CLI you have — updating what exists and repairing what broke."
tags: [onboarding, install, skills, system-prompt, symlink, agents-dir, dotfiles, mcp, cli-tools, idempotent]
author: cskwork
order: 5
use_case: "새 머신을 세팅하거나 여러 코딩 CLI의 스킬·규칙을 한곳에서 관리하고 싶을 때. 에이전트 채팅창에 그대로 붙여넣으면 끝. 이미 설치된 환경이 깨졌을 때 복구용으로도 그대로 쓴다."
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
| AGENTS.md | 공통 규칙 | 프롬프트 내장 7개 규칙 | 모든 CLI가 공유하는 시스템 프롬프트 |
| **Matt Pocock Skills** (37종) | 스킬 | mattpocock/skills | `ask-matt`(설계·디버깅·트레이드오프 판단), `tdd`, `triage`, `code-review`, `research`, `prototype`, `implement`, `to-spec` 등 |
| context-diet | 스킬 | cskwork/context-diet-skill | 시스템 프롬프트 비대화 측정·감축 |
| autoresearch | 스킬 | uditgoenka/autoresearch | 자율 리서치 루프 |
| call-agent | 스킬 | cskwork/call-agent | codex·agy·kiro·claude·notebooklm로 위임 라우팅 |
| archify | 스킬 | tt-a1i/archify | 아키텍처·시퀀스·데이터플로 다이어그램을 단일 HTML로 |
| hallmark | 스킬 | Nutlope/hallmark | AI 티 안 나는 UI 디자인·감사·리디자인 |
| gpt-image-2 | 스킬 | agentspace-so/agent-skills | ChatGPT 구독으로 이미지 생성(별도 과금 없음) |
| superqa | 스킬(전체 레포) | cskwork/superqa-skill | 웹사이트 브라우저 QA(시나리오 생성·실행·리포트) — Python 3.10+ 필요 |
| **code-review-graph** (7종) | 스킬 + CLI + MCP | tirth8205/code-review-graph | 코드를 지식 그래프로 인덱싱, 영향 반경·리뷰 컨텍스트를 토큰 효율적으로 |
| **officecli** (11종) | 스킬 + CLI | iOfficeAI/OfficeCLI | docx·xlsx·pptx 생성·분석, 재무모델·피치덱·논문 레이어 |
| **herdr** | 스킬 + CLI | ogulcancelik/herdr | 코딩 에이전트용 터미널 멀티플렉서 |

> 스킬 총 62종. `~/.agents/skills/` 하나만 보면 6개 CLI 전부의 설치 상태를 알 수 있다.

## 언제 쓰는가

- 새 노트북·서버를 세팅하면서 자주 쓰는 스킬을 한 번에 깔고 싶을 때
- Claude Code·Codex·Gemini CLI·Cursor·Kiro·OpenCode를 섞어 쓰는데, 규칙과 스킬을
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
- **레포 단위 설치기가 전역인 척한다**: `code-review-graph install`은 dry-run으로 보니 작업 레포에
  `.cursorrules`·`.windsurfrules`·`QODER.md` 등 9개 파일을 만들고 프로젝트 `CLAUDE.md`에 append하려 했다.
  서드파티 설치기는 **반드시 `--dry-run` 먼저** 보고 파일 목록을 읽는다.
- **MCP가 "로딩 중"에서 안 끝난다**: 설치기가 러너를 오탐해 `uvx`로 적어두면(pipx로 깔았는데도) 콜드
  스타트마다 패키지를 받는다 — 74개 패키지·31.5MiB 다운로드로 9.6초, 느린 네트워크면 타임아웃. 에러가
  아니라 **무한 로딩으로 보인다**. `command`는 실제 설치된 바이너리 절대경로로 박고, `initialize` →
  `tools/list` 핸드셰이크를 직접 쳐서 시간과 툴 개수를 확인해야 한다.
- **MCP `cwd` 하드코딩**: 설치기가 실행된 디렉터리를 전역 설정에 박아버린다. 지워야 어느 프로젝트에서든
  올바른 그래프를 본다.
- **사용자 소유 심링크가 같이 날아간다**: `~/.agents` 밖 개인 레포를 가리키는 링크는 복구 대상에서
  누락되기 쉽다. 그래서 손대기 전 인벤토리가 필수다.
- **버전 매니저가 비대화형 셸에서 안 깨어난다**: `node`가 nvm shim으로 잡혀 `command not found: _load_nvm`이
  나는데 `/opt/homebrew/bin/node`는 멀쩡하다. 인터프리터는 절대경로로 고정한다.
- **자기 안에서 도는 도구는 자기를 업데이트 못 한다**: herdr 세션 안에서 `herdr update`를 하면 다운로드만
  되고 교체가 막힌다. 우회하지 말고 사용자에게 명령을 넘긴다.
- **이전 설정의 형제 파일이 남는다**: 지시문 정본을 바꿔도 `~/.kiro/steering/`에 남은 옛 파일이 같이
  로드된다. 디렉터리를 훑어 잔재를 정리해야 한다.
- **심링크 권한 + 파일/폴더 구분 (Windows 핵심 함정)**: 심볼릭 링크는 개발자 모드나 관리자 권한이 필요하다.
  없으면 **파일은 하드링크**, **폴더(skills)는 정션(junction)** 으로 갈라야 한다. `mklink /H`는 폴더에
  안 통한다. macOS·Linux는 `ln -s` 하나로 둘 다 된다.
- **검증 스크립트가 상태를 바꾸면 안 된다**: 인자를 무시하는 스크립트에 `--dry-run`을 넘기면 점검이 아니라
  실행이 된다. 감사는 반드시 별도의 읽기 전용 스크립트로 한다.

아래 프롬프트를 에이전트 채팅창에 그대로 붙여넣으세요.

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

Identify installed agents: Claude Code, Codex, Kiro, Antigravity/agy, Gemini CLI, OpenCode, Cursor.
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
  Code Review Graph (skill + MCP)     https://github.com/tirth8205/code-review-graph
  OfficeCLI                           https://github.com/iOfficeAI/OfficeCLI
  Herdr                               https://github.com/ogulcancelik/herdr
  SuperQA                             https://github.com/cskwork/superqa-skill
    Whole-repo skill. After linking, also run:
      pip3 install textual playwright pyyaml && python3 -m playwright install chromium
    Needs Python 3.10+. Do not run the browser install if Python is older — report instead.

Derive each skill's canonical name from its SKILL.md frontmatter 'name:' field, not from the
directory name, and fail loudly on a collision instead of silently overwriting.

=== 5. INSTALL STANDALONE TOOLS ===

Install or update via the official package manager. USE THE SAME MECHANISM THE TOOL IS ALREADY
INSTALLED WITH — switching from a curl installer to Homebrew (or pip to uv) leaves two binaries on
PATH and the wrong one wins.

  Code Review Graph   pipx install code-review-graph   (or uv tool install)
  OfficeCLI           brew install officecli
  Herdr               official installer, or 'herdr update'

If a tool cannot update because the current session is running inside it (Herdr does this), do not
work around it. Report the exact command for me to run after I exit.

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
 4. If the tool supports a multi-repo registry, register each built graph so the tools work from a
    parent directory as well as from inside each repo.

=== 7. GLOBAL INSTRUCTION FILES ===

Replace every detected agent's global instruction file with exactly these seven rules:

 1. Inspect repository instructions, tests, and similar code before editing.
 2. Use Ask Matt for architecture, debugging, testing, and implementation trade-offs.
 3. Clarify only consequential decisions; otherwise, choose a reversible assumption and continue.
 4. Make the smallest maintainable change and avoid unrelated refactoring.
 5. Batch independent reads in one turn and delegate independent work to fresh-context subagents.
 6. Pass subagent briefs and results through files, never by dumping large outputs into the main context.
 7. Verify work with tests, type checks, builds, or reproducible commands, explain it plainly, and
    never claim unverified success.

Targets: global CLAUDE.md, AGENTS.md, GEMINI.md, OpenCode instructions, Kiro steering.
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

Then link each agent's global skills directory to ~/.agents/skills:
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
  - Every CLI responds to --version / --help.
  - Every MCP server passes the handshake probe from step 6.3.
  - Instruction-file checksums are identical across all agent paths.
  - No autonomous loop was started, no Context Diet restriction was activated, no paid service was
    authenticated, and no credits were spent.
  - gpt-image-2 is configured but not wired to trigger on anything except an explicit request.
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
