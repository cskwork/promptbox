---
title: claude-swap
summary: "Claude Code 계정을 여러 개 등록해 두고 로그아웃 없이 한 줄 명령으로 바꿔 쓰는 도구 — CLI와 VS Code 확장 양쪽에서 동작하고, 계정별 5h/7d 사용량과 리셋 시각까지 보여준다."
summary_en: "Switch between multiple Claude Code accounts without logging out — works in both the CLI and the VS Code extension, with per-account usage and reset times."
tags: [tool, cli, python, claude-code, account-switcher, multi-account, mit]
source: https://github.com/realiti4/claude-swap
author: realiti4
license: MIT
languages: [Python]
platforms: [macOS, Linux, Windows, WSL]
order: 35
install: "uv tool install claude-swap"
---

## 한 줄

Claude 계정을 여러 개 쓰는 사람이 매번 로그아웃/재로그인하지 않고 `cswap --switch` 한 줄로 다음 계정으로 돌려쓰게 해 주는 도구. OAuth 토큰과 설정을 백업해 두었다가 전환할 때 자격증명(credentials)만 갈아끼우는 방식이라, rate limit(사용량 제한)에 걸린 계정을 빠르게 우회할 수 있다.

*EN: Rotate to the next Claude account with one command instead of logging out and back in.*

## 언제 쓰는가

- Claude 구독 계정을 2개 이상 두고 5h/7d 사용량 한도를 번갈아 쓰고 싶을 때
- 한 계정이 rate limit에 걸렸을 때 세션을 이어가며 다른 계정으로 넘어가고 싶을 때
- CLI와 VS Code 확장을 오가며 같은 계정 풀을 공유하고 싶을 때

## 설치

```bash
# uv (권장)
uv tool install claude-swap

# 또는 pipx
pipx install claude-swap

# 업데이트
uv tool upgrade claude-swap
```

## 기본 사용

```bash
cswap --add-account          # 현재 로그인된 계정을 등록 (계정마다 1회)
cswap --switch               # 다음 계정으로 회전
cswap --switch-to 2          # 특정 슬롯/이메일로 바로 전환
cswap --list                 # 계정별 5h/7d 사용량·리셋 시각
cswap --status               # 현재 활성 계정
cswap --tui                  # 화살표 키 메뉴
```

## 함정

- 전환 후에는 Claude Code(또는 VS Code 확장 탭)를 **재시작**해야 새 계정이 적용된다
- 토큰이 만료된 계정은 다시 로그인한 뒤 `cswap --add-account`로 갱신 (중복 생성 안 됨)
- 자격증명 저장 위치가 OS마다 다름 — macOS Keychain, Windows Credential Manager, Linux/WSL은 파일 기반(`XDG_DATA_HOME`로 변경 가능)
- 전환 직후 첫 메시지는 대화 캐시 재구성으로 사용량이 조금 더 들 수 있다
