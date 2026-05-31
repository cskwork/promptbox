---
title: codex-auth
summary: "OpenAI Codex 계정을 여러 개 저장해 두고 명령 하나로 전환하는 CLI — Codex CLI·VS Code 확장·Codex App에서 쓰며, 계정별 사용량 조회와 별칭(alias) 관리까지 된다."
summary_en: "A CLI to store and switch between multiple OpenAI Codex accounts — works with the Codex CLI, VS Code extension, and Codex App, with usage state and account aliases."
tags: [tool, cli, codex, account-switcher, multi-account, npm, mit]
source: https://github.com/Loongphy/codex-auth
author: Loongphy
license: MIT
languages: [TypeScript]
platforms: [macOS, Linux, Windows]
order: 40
install: "npm install -g @loongphy/codex-auth"
---

## 한 줄

Codex 계정 여러 개를 등록해 두고 `codex-auth switch`로 활성 계정을 바꿔 쓰는 도구. 계정마다 사용량 상태를 조회하고, 별칭을 붙이거나 auth 파일을 import/export해 머신 간 이전까지 할 수 있다. claude-swap의 Codex 버전이라고 보면 된다.

*EN: Switch the active Codex account interactively, with usage state, aliases, and auth import/export.*

## 언제 쓰는가

- Codex 계정을 업무용/개인용 등 여러 개로 나눠 쓰고 빠르게 전환하고 싶을 때
- 계정별 사용량과 활성 상태를 한눈에 확인하고 싶을 때 (`list --live`, `list --active`)
- 다른 머신으로 계정 자격증명을 옮기거나 백업하고 싶을 때 (`import`/`export`)

## 설치

```bash
# 전역 설치
npm install -g @loongphy/codex-auth

# 설치 없이 한 번만
npx @loongphy/codex-auth list
```

계정 추가를 쉽게 하려면 Codex CLI도 함께 두는 것을 권장: `npm install -g @openai/codex`

## 기본 사용

```bash
codex-auth login             # codex login 실행 후 현재 계정 등록
codex-auth list              # 저장된 계정·사용량 상태
codex-auth list --active     # 현재 활성 계정만
codex-auth switch            # 활성 계정 대화형 전환
codex-auth switch 02         # 행 번호로 바로 전환
codex-auth alias set 2 work  # 계정에 별칭 부여
codex-auth import auth.json --alias personal
```

## 함정

- Codex CLI·App 사용자는 전환 후 **클라이언트 재시작** 필요 (재시작 없는 자동 전환은 포크 `codext` 사용)
- `app` 명령은 **실험적** — 공식 Codex App 변경에 따라 동작 안 하거나 앱을 깨뜨릴 수 있음
- 문서는 v0.3.x 기준 — 설치 버전이 낮으면 일부 명령이 없을 수 있다 (`@next`로 알파 시도, v0.2.x 다운그레이드 시 `registry.json`의 `schema_version` 수동 조정)
