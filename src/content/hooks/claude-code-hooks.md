---
title: claude-code-hooks (모음)
summary: AI 코딩 도구의 명령을 실행 직전에 가로채 위험을 막거나 보완해 주는 개인용 훅 4종 묶음 - ssh 직접 접속 차단, 빌드 전 MyBatis XML 검사, 웹 검색에 올해 연도 자동 추가, 코드 검색 전 그래프 힌트까지 한 번에.
summary_en: Four hooks that bar direct SSH, validate MyBatis XML before builds, keep web searches current, and nudge graph-aware code search.
tags: [hook, claude-code, pretooluse, ssh-guard, mybatis, websearch]
source: https://github.com/cskwork/claude-code-hooks
author: cskwork
license: MIT
order: 10
event: PreToolUse
matcher: "Bash · WebSearch"
scope: both
deps: [bash, python3, xmllint]
install: "git clone https://github.com/cskwork/claude-code-hooks ~/code/claude-code-hooks && ln -sf ~/code/claude-code-hooks/hooks/*.sh .claude/hooks/"
---

## 한 줄

Claude Code가 명령을 실행하기 직전·직후에 끼어들어 위험한 작업을 막거나 보완하는 개인용 훅(hook, 자동 실행 스크립트) 4종. 글로벌 `~/.claude/settings.json` 또는 프로젝트 `.claude/settings.json`에 등록해 켠다. hook 스펙: PreToolUse / PostToolUse, stdin(표준 입력) JSON / stdout(표준 출력) `hookSpecificOutput`, exit 2 = block(차단).

*EN: Four personal hooks that step in right before Claude Code runs a command, to block or augment risky actions.*

## 카탈로그

| Hook | Event | 트리거 | 목적 |
|---|---|---|---|
| `validate-mybatis-xml.sh` | PreToolUse(Bash) | `gradlew build/test/bootRun/assemble/check` | MyBatis 매퍼 XML well-formedness(태그가 올바르게 닫혀 있는지 검사) 사전 검증, 실패 시 명령 deny(차단) |
| `ssh-guard.sh` | PreToolUse(Bash) | 직접 `ssh`/`scp`/`sftp`/`sshpass`, wrapper의 `--shell`/`--allow-write` | 감사 가능한 wrapper 경로 강제 |
| `web-search-year-inject.py` | PreToolUse(WebSearch) | 쿼리에 연도/시간 키워드 없을 때 | 끝에 현재 연도 자동 부착 → 최신 결과 우선 |
| `graphify-hint.sh` | PreToolUse(Bash) | `grep`/`rg`/`find`/`fd`/`ack`/`ag` | `graphify-out/` · `.codegraph/` 있으면 raw search 전 힌트 |

## 설치 (요약)

```bash
git clone https://github.com/cskwork/claude-code-hooks ~/code/claude-code-hooks

# 프로젝트 적용
mkdir -p .claude/hooks
ln -sf ~/code/claude-code-hooks/hooks/validate-mybatis-xml.sh .claude/hooks/
ln -sf ~/code/claude-code-hooks/hooks/ssh-guard.sh            .claude/hooks/
ln -sf ~/code/claude-code-hooks/hooks/graphify-hint.sh        .claude/hooks/
```

## 핵심 환경 변수

- `MYBATIS_XML_ROOT`, `MYBATIS_XML_TRIGGERS`
- `SSH_GUARD_WRAPPER` (허용 wrapper regex), `SSH_GUARD_BLOCKED_FLAGS`
- `GRAPHIFY_HINT_FILE`, `GRAPHIFY_HINT_REPORT`

## settings.json 패턴 (그대로 복사)

````json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/validate-mybatis-xml.sh" },
          { "type": "command", "command": "bash .claude/hooks/ssh-guard.sh" },
          { "type": "command", "command": "bash .claude/hooks/graphify-hint.sh" }
        ]
      },
      {
        "matcher": "WebSearch",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /Users/<you>/code/claude-code-hooks/hooks/web-search-year-inject.py",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
````

## 호환성 / 함정

- Claude Code hook spec 표준 — `tool_input` JSON via stdin, `hookSpecificOutput` JSON via stdout, exit 2 = block
- macOS / Linux. `bash`, `python3`, `xmllint` (mybatis 한정)
- 글로벌 `settings.json`에는 **절대경로**로 등록 (PWD가 매번 다르기 때문)
- 보호 브랜치(main/stg/prd) 직접 push 차단은 본 컬렉션 `git-guardrails`(Matt Pocock)가 더 폭넓게 처리(모든 `git push`·`reset --hard`·`clean -fd` 차단) — 역할이 겹쳐 이 묶음에서 `branch-guard.sh`는 제외했다(원본 레포에는 그대로 포함).
- ssh-guard는 `ssh-keygen`/`ssh-keyscan`/`ssh-add`/`ssh-copy-id`는 예외
