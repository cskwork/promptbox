---
title: setup-pre-commit (Matt Pocock)
summary: "git commit 전에 포맷팅·타입·테스트를 자동으로 실행해, 망가진 코드가 커밋되지 않게 막아주는 pre-commit 환경을 한 번에 설치."
summary_en: "Installs a one-shot pre-commit setup that auto-formats your code and runs type and test checks before every git commit, so broken code never lands."
tags: [skill, hook, pre-commit, husky, lint-staged, prettier, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/misc/setup-pre-commit
author: Matt Pocock
license: MIT
order: 12
trigger: "사용자가 'pre-commit 추가', 'husky 설정', 'lint-staged', 'commit-time formatting/typecheck/test' 요청 시"
install: "Claude Code 세션에서 `/setup-pre-commit` 또는 SKILL.md를 ~/.claude/skills/에 복사"
---

## 한 줄

커밋 전에 자동으로 돌아가는 검사 장치(Husky pre-commit hook)를 SKILL 호출 한 번으로 설치. 패키지 매니저 감지부터 시험 커밋까지 7단계 체크리스트로 끝낸다.
*EN: Sets up the checks that run automatically before each commit, in a single call.*

## 무엇을 설치하나

| 항목 | 역할 |
|---|---|
| `husky` | git hook 디렉터리 자동 관리, `.husky/pre-commit` 실행 |
| `lint-staged` | 스테이징된 파일에만 명령 실행 (전체 격납 방지) |
| `prettier` | 스테이징 파일 자동 포맷 (`--ignore-unknown`로 못 읽는 파일은 skip) |
| `.husky/pre-commit` | `lint-staged → typecheck → test` 순서로 실행 |
| `.lintstagedrc` | `"*": "prettier --ignore-unknown --write"` |
| `.prettierrc` | 부재 시 mattpocock 기본값 (tab 2, 80폭, double-quote, semi, ES5 trailing comma) |

## 단계 (요약)

1. **패키지 매니저 감지** — `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` / `bun.lockb` 중 존재하는 것
2. **devDeps 설치** — `husky lint-staged prettier`
3. **Husky init** — `npx husky init` (자동으로 `.husky/` 생성 + `prepare: "husky"` 추가)
4. **`.husky/pre-commit` 작성** — 셔뱅 불필요(Husky v9+)
   ```sh
   npx lint-staged
   npm run typecheck
   npm run test
   ```
5. **`.lintstagedrc` 작성**
6. **`.prettierrc` 작성** (없을 때만)
7. **검증 + smoke commit** — 스테이지 → commit → hook 통과 여부 확인

## 적용 시 결정 포인트

- `typecheck`/`test` 스크립트가 `package.json`에 없으면 해당 라인을 **생략하고 사용자에게 알림** (없는 스크립트를 무조건 추가하지 않음)
- `.prettierrc`가 이미 있으면 **덮어쓰지 않음**
- 모노레포라면 lock 파일 감지가 루트만 보므로, 워크스페이스에서 실행하려면 SKILL 호출 시 `cd <pkg>` 후 실행

## 한계

- Husky v9+ 기준 — v8 이하는 셔뱅/install 절차 다름
- ESLint는 의도적으로 미포함 (Prettier만) — ESLint도 원하면 `.lintstagedrc`에 `eslint --fix` 한 줄 추가
- Windows 호환은 git-bash/WSL 통하면 OK, 순수 PowerShell은 husky가 별도 wrapper 필요

## 같이 보면 좋은

- 본 컬렉션 `git-guardrails-claude-code (Matt Pocock)` — Claude Code 측 PreToolUse hook (런타임 차단)
- `claude-code-hooks` — branch-guard/ssh-guard 등 PreToolUse hook 모음
