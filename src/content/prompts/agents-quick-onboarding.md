---
title: pi 온보딩 한 방 설치
title_en: One-shot pi setup
summary: "pi를 기본 코딩 에이전트로 설치하고, cskwork/pi-setup-public을 정본으로 동기화해 설정·에이전트·스킬·모델 프로파일을 복원하며, 기본 시스템 프롬프트 cskwork/THE-SYSTEM-PROMPT를 `~/.agents/AGENTS.md`로 받아 모든 에이전트에 연결하는 복사-붙여넣기 프롬프트. 기본 모델 GLM-5.3-Flash는 텍스트와 이미지를 직접 입력받는다."
summary_en: "One paste-and-go prompt that installs pi, syncs the canonical cskwork/pi-setup-public repository, and restores its settings, agents, skills, and model profiles. It also fetches the default system prompt from cskwork/THE-SYSTEM-PROMPT into `~/.agents/AGENTS.md` and links that one file into every coding agent on the machine, and uses GLM-5.3-Flash's native multimodal input without a separate vision add-on."
tags: [onboarding, pi, pi-setup, agents-md, system-prompt, glm-5.3-flash, multimodal, dotfiles, idempotent]
source: https://github.com/cskwork/pi-setup-public
author: cskwork
order: 1
use_case: "새 머신에서 pi 환경을 복원하거나, 현재 설정을 cskwork/pi-setup-public 정본과 다시 동기화할 때."
use_case_en: "Restore pi on a new machine or resync an existing installation from the canonical cskwork/pi-setup-public repository."
---

## 한 줄

기본 하네스(에이전트를 실행하는 틀)는 **pi**다. 아래 프롬프트 하나가 Node.js와 pi를 확인하고,
[`cskwork/pi-setup-public`](https://github.com/cskwork/pi-setup-public)을 `~/pi-setup-public`에 동기화한 뒤 공식
`install.sh`로 설정 전체를 복원한다.

## 무엇을 하는가

1. Node.js 22+와 `pi`를 확인하고, 빠졌을 때만 설치한다.
2. `~/pi-setup-public`을 정본 저장소와 `git pull --ff-only`로 동기화한다.
3. `models.json`에서 `glm-5.3-flash`가 `text`와 `image` 입력을 모두 선언했는지 확인한다.
4. 설치기를 실행해 `~/.pi/agent/` 설정·에이전트·스킬·프로파일을 연결한다.
5. 기본 시스템 프롬프트를 [`cskwork/THE-SYSTEM-PROMPT`](https://github.com/cskwork/THE-SYSTEM-PROMPT)에서
   `~/.agents/AGENTS.md`로 받고, 그 한 파일을 Claude Code·Codex·Gemini·OpenCode·pi 설정 경로에 심링크한다.
   어느 에이전트로 들어가도 같은 계약을 읽는다.
6. 인증, 모델 목록, 패키지, 텍스트 왕복, 가능한 경우 이미지 입력까지 실제 명령으로 검증한다.

## 함정

- 로컬 수정이 있으면 버리지 않는다. 프롬프트는 `reset --hard`, `git clean`, `rm -rf`를 금지한다.
- 운영 지침 심링크 대상이 이미 일반 파일이면 덮어쓰지 않는다. 타임스탬프 백업으로 옮긴 뒤 경로를 보고한다.
  Windows는 심링크에 개발자 모드나 관리자 터미널이 필요하고, 복사본은 시간이 지나면 드리프트(원본과 어긋남)한다.
- API 키는 채팅에 붙이지 않는다. 인증이 없으면 사용자가 `pi auth`를 직접 실행하도록 멈춘다.
- Windows에서는 저장소 README가 제공하는 경로만 따른다. bash 스크립트를 PowerShell로 임의 번역하지 않는다.

아래 프롬프트를 실행 중인 코딩 에이전트 채팅창에 그대로 붙여넣으세요.

```text
Set up or refresh my default coding-agent environment from https://github.com/cskwork/pi-setup-public.
The default harness is pi. The default Z.ai model is GLM-5.3-Flash, which accepts text and images natively.

Work autonomously and make the process idempotent. Preserve user-owned files and settings unless the
pi-setup installer explicitly owns them. Never print credentials. Report real verification output.

1. Detect the operating system and shell.
   - Supported: macOS, Linux, and Windows.
   - On Windows, prefer PowerShell for bootstrap commands. pi itself uses Git Bash internally.

2. Ensure Node.js 22+ and npm are available.
   - First run `node -v` and `npm -v`.
   - If Node is missing or older than 22, use the platform package manager when available.
   - If no safe package manager is available, stop and tell me to install Node 22 from https://nodejs.org.

3. Ensure pi is installed.
   - Check with `pi --version`.
   - If missing, run:
     `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`
   - Re-run `pi --version`. If the command is still missing, report the npm global prefix and ask me to
     open a new terminal. Do not patch PATH silently.

4. Clone or update pi-setup at `~/pi-setup-public`.
   - Canonical remote: `https://github.com/cskwork/pi-setup-public.git`.
   - If the directory is absent, clone it.
   - If it is a clean clone of that remote, run `git pull --ff-only`.
   - If it has local changes, do not discard them. Report the diff summary and continue with the local tree.
   - If the path exists but is not that repository, move it to a timestamped backup path before cloning.
   - Never use `git reset --hard`, `git clean`, or `rm -rf`.

5. Validate the checked-out setup before installing.
   - `models.json` must declare model id `glm-5.3-flash` with input types `text` and `image`.
   - The configured default model must be `glm-5.3-flash` on provider `zai`.
   - If any check fails, stop installation and report that pi-setup is stale. Do not invent a local workaround.

6. Run the repository installer.
   - macOS/Linux/Git Bash: `~/pi-setup-public/install.sh`.
   - Windows PowerShell: run the documented Windows path from the repository README; do not translate the
     shell script by guessing.
   - The installer backs up replaced files and links or copies `~/.pi/agent` configuration from the repo.

7. Install the default system prompt and share it with every coding agent on this machine.
   - Canonical source: https://github.com/cskwork/THE-SYSTEM-PROMPT, file `AGENTS.md`. It is the
     operating contract: understand the intended outcome, resolve uncertainty from evidence, agree on
     scope and observable success, then work autonomously and verify before claiming completion. It asks
     again only for data loss, public API changes, security consequences, or migrations.
   - Keep one canonical local copy at `~/.agents/AGENTS.md`:
     `mkdir -p ~/.agents`
     `curl -fsSL https://raw.githubusercontent.com/cskwork/THE-SYSTEM-PROMPT/main/AGENTS.md -o ~/.agents/AGENTS.md`
     If that file already exists and differs, move it to a timestamped backup first and report the path.
   - Link the one file into each agent you use, and skip any directory whose agent is not installed:
     `ln -sfn ~/.agents/AGENTS.md ~/.claude/CLAUDE.md`
     `ln -sfn ~/.agents/AGENTS.md ~/.codex/AGENTS.md`
     `ln -sfn ~/.agents/AGENTS.md ~/.gemini/GEMINI.md`
     `ln -sfn ~/.agents/AGENTS.md ~/.config/opencode/AGENTS.md`
     `ln -sfn ~/.agents/AGENTS.md ~/.pi/agent/AGENTS.md`
   - The pi installer points `~/.pi/agent/AGENTS.md` at the pi-setup copy of the same contract. Relinking
     it here keeps one source of truth; the pi-setup copy stays a mirror.
   - If a target is an existing regular file rather than a symlink, move it to a timestamped backup first
     and report the path. Never overwrite my own instructions in place.
   - On Windows, symlinks need Developer Mode or an admin terminal. Copy the file instead and tell me the
     copy will drift.

8. Check authentication without exposing a key.
   - Run `pi auth check --provider zai`.
   - If it is not ready, tell me to run `pi auth`, log in to Z.ai, restart pi, and rerun this prompt.
   - Never ask me to paste an API key into chat.

9. Verify the installed setup with real commands.
   - `pi --version`
   - `pi auth check --provider zai`
   - `pi --list-models zai` and confirm `glm-5.3-flash` appears.
   - Parse `~/.pi/agent/models.json` and confirm `glm-5.3-flash` has both `text` and `image` inputs.
   - Resolve every operating-instruction link from step 7 and confirm each one points at
     `~/.agents/AGENTS.md`.
   - `pi list` and report the installed package count.
   - If Z.ai auth is ready, run a text round trip:
     `pi -p "reply with exactly: PI-SETUP-OK" --no-session`
   - If a local image is available, run one native multimodal probe by asking GLM-5.3-Flash to read it.
     Do not install an image adapter if no image is available; report that the image probe was skipped.

10. Finish with a numbered report.
   - State the OS and shell.
   - State the pi and Node versions.
   - State whether pi-setup was cloned, updated, or already current.
   - State which agents now read the operating instructions, and which were skipped because they are absent.
   - State whether Z.ai authentication and text/image capability were verified or remain user actions.
   - State the backup path created by the installer, if any.
   - Do not commit or push either repository.
```
