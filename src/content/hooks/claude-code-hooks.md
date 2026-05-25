---
title: claude-code-hooks (모음)
summary: Claude Code의 PreToolUse / PostToolUse 훅 5종 모음. MyBatis XML 사전 검증, 보호 브랜치 commit·push 차단, ssh/scp 직접 호출 차단, WebSearch 쿼리에 현재 연도 자동 부착, grep/find 호출 시 graphify 인덱스 사용 힌트. 프로젝트별·글로벌 settings.json에 plug-and-play.
tags: [hook, claude-code, pretooluse, branch-guard, ssh-guard, mybatis, websearch]
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

Claude Code의 hook 스펙(PreToolUse / PostToolUse, stdin JSON / stdout `hookSpecificOutput`, exit 2 = block)에 맞춘 개인용 훅 5종. 글로벌 `~/.claude/settings.json` 또는 프로젝트 `.claude/settings.json`에 enable.

## 카탈로그

| Hook | Event | 트리거 | 목적 |
|---|---|---|---|
| `validate-mybatis-xml.sh` | PreToolUse(Bash) | `gradlew build/test/bootRun/assemble/check` | MyBatis 매퍼 XML well-formedness 사전 검증, 실패 시 명령 deny |
| `branch-guard.sh` | PreToolUse(Bash) | `git commit`/`git push` on 보호 브랜치 | `stg`/`prd`/`main` 등 보호 브랜치 직접 commit·push·force push 차단 |
| `ssh-guard.sh` | PreToolUse(Bash) | 직접 `ssh`/`scp`/`sftp`/`sshpass`, wrapper의 `--shell`/`--allow-write` | 감사 가능한 wrapper 경로 강제 |
| `web-search-year-inject.py` | PreToolUse(WebSearch) | 쿼리에 연도/시간 키워드 없을 때 | 끝에 현재 연도 자동 부착 → 최신 결과 우선 |
| `graphify-hint.sh` | PreToolUse(Bash) | `grep`/`rg`/`find`/`fd`/`ack`/`ag` | `graphify-out/` · `.codegraph/` 있으면 raw search 전 힌트 |

## 설치 (요약)

```bash
git clone https://github.com/cskwork/claude-code-hooks ~/code/claude-code-hooks

# 프로젝트 적용
mkdir -p .claude/hooks
ln -sf ~/code/claude-code-hooks/hooks/validate-mybatis-xml.sh .claude/hooks/
ln -sf ~/code/claude-code-hooks/hooks/branch-guard.sh         .claude/hooks/
ln -sf ~/code/claude-code-hooks/hooks/ssh-guard.sh            .claude/hooks/
ln -sf ~/code/claude-code-hooks/hooks/graphify-hint.sh        .claude/hooks/
```

## 핵심 환경 변수

- `CC_PROTECTED_BRANCHES` (default `main,master,stg,staging,prd,prod,production,release,aidt-prd,aidt-stg`), `CC_PROTECTED_BYPASS=1` (긴급 우회)
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
          { "type": "command", "command": "bash .claude/hooks/branch-guard.sh" },
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
- branch-guard는 refspec mapping (`git push origin foo:main`)까지 본다
- ssh-guard는 `ssh-keygen`/`ssh-keyscan`/`ssh-add`/`ssh-copy-id`는 예외
