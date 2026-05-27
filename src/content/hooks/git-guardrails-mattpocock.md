---
title: git-guardrails-claude-code (Matt Pocock)
summary: Claude Code의 PreToolUse(Bash) hook 하나로 `git push`, `reset --hard`, `clean -fd`, `branch -D`, `checkout .`, `restore .` 같은 파괴적/되돌리기 어려운 git 명령을 실행 전에 차단. bash + jq + grep만 의존하므로 매 Bash 호출 오버헤드가 수 ms. npx 기반 `block-no-verify`처럼 매번 npm 캐시를 verify하지 않아 폭주 위험이 없다.
tags: [hook, claude-code, pretooluse, git, guardrail, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/misc/git-guardrails-claude-code
author: Matt Pocock
license: MIT
order: 11
event: PreToolUse
matcher: Bash
scope: both
deps: [bash, jq, grep]
install: "curl -fsSL https://raw.githubusercontent.com/mattpocock/skills/main/skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh -o ~/.claude/hooks/block-dangerous-git.sh && chmod +x ~/.claude/hooks/block-dangerous-git.sh"
---

## 한 줄

`tool_input.command`를 stdin JSON으로 받아 위험 패턴을 정규식으로 매칭, 매치 시 exit 2 + stderr 메시지로 Claude의 명령 실행을 거부시키는 8줄짜리 bash 스크립트.

## 차단 패턴 (기본)

| 패턴 | 의미 |
|---|---|
| `git push` | 모든 push (force push 포함) |
| `git reset --hard` | 작업 트리 강제 폐기 |
| `git clean -f` / `git clean -fd` | 추적 안 된 파일 강제 삭제 |
| `git branch -D` | 머지 안 된 브랜치 강제 삭제 |
| `git checkout \.` / `git restore \.` | 모든 변경사항 폐기 |
| `push --force`, `reset --hard` | 위 패턴의 부분 매칭 (이중 방어) |

## 설치

### 1) 스크립트 복사 (글로벌 또는 프로젝트)

```bash
# 글로벌
curl -fsSL https://raw.githubusercontent.com/mattpocock/skills/main/skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh \
  -o ~/.claude/hooks/block-dangerous-git.sh
chmod +x ~/.claude/hooks/block-dangerous-git.sh

# 프로젝트
mkdir -p .claude/hooks
curl -fsSL https://raw.githubusercontent.com/mattpocock/skills/main/skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh \
  -o .claude/hooks/block-dangerous-git.sh
chmod +x .claude/hooks/block-dangerous-git.sh
```

### 2) settings.json에 등록

**글로벌** (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/block-dangerous-git.sh", "timeout": 5 }
        ]
      }
    ]
  }
}
```

**프로젝트** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh" }
        ]
      }
    ]
  }
}
```

### 3) 동작 확인

```bash
echo '{"tool_input":{"command":"git push origin main"}}' \
  | ~/.claude/hooks/block-dangerous-git.sh
# → exit 2 + "BLOCKED: ... matches dangerous pattern 'git push'"
```

## 패턴 커스터마이즈

스크립트 안 `DANGEROUS_PATTERNS` 배열만 수정. ERE 정규식이라 점은 `\.`처럼 이스케이프.

```bash
DANGEROUS_PATTERNS=(
  "git push"
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "push --force"
  "reset --hard"
  # 추가 예: hook 우회 차단
  "--no-verify"
  "--no-gpg-sign"
)
```

## 함정 (실전에서 발견)

- **grep 옵션 충돌**: 패턴이 `-`로 시작하면(`--no-verify`, `--no-gpg-sign`) `grep -qE`가 패턴을 자기 옵션으로 오인. 추가 시 반드시 `grep -qE -- "$pattern"`로 `--`를 끼워 옵션 종결을 명시.
- **jq 필수**: 없으면 빈 `COMMAND`로 모든 명령이 통과(fail-open). macOS는 `brew install jq`.
- **이중 등록 가능**: 다른 Bash hook과 양립. 어느 한 쪽이 먼저 exit 2면 실행 차단.
- **`npx block-no-verify@1.1.2` 대체용**: npm 캐시 verify가 매 Bash 호출마다 일어나 CPU 폭주 사례 있음(관측치 ~165% CPU). 이 hook은 bash 한 줄 수 ms로 끝나 폭주 없음.

## 같이 보면 좋은

- 본 컬렉션 `claude-code-hooks` — 보호 브랜치/ssh/WebSearch 등 추가 hook 모음
