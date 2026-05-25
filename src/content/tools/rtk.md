---
title: rtk (Rust Token Killer)
summary: 100+ dev 명령(git, cargo, pytest, docker, aws, npm, kubectl 등)의 출력을 필터·압축·중복 제거해 LLM context에 넣을 토큰을 60-90% 절감. 단일 Rust 바이너리, zero dependencies.
tags: [tool, cli, rust, token-optimization, claude-code, copilot, cursor, gemini-cli, apache-2.0]
source: https://github.com/rtk-ai/rtk
author: rtk-ai
license: Apache-2.0
languages: [Rust]
platforms: [macOS, Linux, Windows, WSL]
order: 15
install: "brew install rtk"
---

## 한 줄

`git status`, `cargo test`, `kubectl logs` 같은 명령의 출력은 에이전트 context의 token vacuum. rtk가 사이에 끼어서 필요한 라인만 남기고 줄여준다 — auto-rewrite hook으로 transparent하게 가로채는 모드까지 있음.

## 언제 쓰는가

- 큰 `git status`, `cargo test`, `docker logs`, `kubectl describe` 결과가 context window를 잡아먹을 때
- Claude Code · Copilot · Cursor · Gemini CLI 13개 AI 코딩 툴 어디서나 동일하게
- 토큰 절감 효과를 측정·시각화하고 싶을 때 (`rtk gain`, `rtk discover`)

## 설치

```bash
# macOS / Linux
brew install rtk

# 또는
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Cargo
cargo install --git https://github.com/rtk-ai/rtk

# Windows: pre-built binary from Releases (WSL 권장)
```

## 기본 사용

```bash
rtk init -g                    # Claude Code용 hook 설치 (auto-rewrite)
git status                     # → 자동으로 rtk git status로 재작성
rtk cargo test                 # 압축된 test 출력
rtk ls .                       # 토큰 최적화된 디렉터리 트리
rtk gain                       # 토큰 절감 통계
rtk discover                   # 어떤 명령에 rtk가 도움되는지 분석
```

## 함정

- Windows native는 limitation 있음 — 전체 기능은 WSL에서
- auto-rewrite hook은 셸 설정 변경하니 install 후 새 셸에서 검증
- 압축 정책이 명령마다 다르므로 처음 쓸 때 `rtk gain`으로 실제 절감 확인 권장

## 지원 도구

Claude Code, GitHub Copilot, Cursor, Gemini CLI 외 13종 — `rtk init` 단계에서 자동 감지/등록.
