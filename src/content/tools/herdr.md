---
title: herdr
summary: "코딩 에이전트를 위한 tmux — 여러 에이전트 세션을 한 터미널 안에서 페인으로 나눠 띄우고, 각 에이전트가 막혔는지·일하는지·끝났는지 한눈에 보면서, 떼었다 다시 붙여도 작업이 안 끊긴다. macOS·Linux는 정식, Windows는 베타."
summary_en: "tmux for coding agents — run many agent sessions as panes in one terminal, see which is blocked/working/done at a glance, and detach/reattach without losing work."
tags: [tool, multiplexer, terminal, coding-agent, tmux, ssh, rust]
source: https://github.com/ogulcancelik/herdr
author: ogulcancelik
languages: [Rust, TypeScript, Python]
platforms: [macOS, Linux, Windows]
order: 15
install: "curl -fsSL https://herdr.dev/install.sh | sh"
---

## 한 줄

"터미널 하나로 무리 전체를(One terminal. The whole herd.)" — 터미널에 tmux(여러 셸 세션을 한 화면에서 나눠 쓰는 멀티플렉서)가 있다면, 코딩 에이전트에는 herdr가 있다. Claude·Codex 같은 에이전트 여러 개를 페인(pane, 화면을 나눈 칸)으로 띄워 동시에 굴리고, 각 페인의 에이전트 상태(blocked·working·done·idle)를 색으로 바로 본다.

## 언제 쓰는가

- 에이전트를 한 번에 여러 개 돌리는데 어떤 게 멈췄고 어떤 게 입력을 기다리는지 매번 들여다보기 번거로울 때
- 긴 작업을 띄워 놓고 세션을 detach(분리)했다가 나중에 reattach(재접속)해도 프로세스가 살아 있길 원할 때
- 서버나 원격 머신에 ssh로 붙어서, 심지어 모바일에서도 돌아가는 에이전트 세션을 확인하고 싶을 때
- CLI·JSON 소켓 API로 페인 생성·전환을 스크립트로 자동화하고 싶을 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| Real panes | 마우스 우선 레이아웃 + 탭 + 워크스페이스 |
| Agent state | blocked·working·done·idle 상태를 색으로 표시 |
| Persistent sessions | detach 후 reattach해도 실행 중 프로세스 유지 |
| Control surface | CLI + JSON 소켓 API로 프로그램 제어 |
| Remote SSH attach | 어디서나(모바일 포함) 세션 접속 |
| Responsive TUI | 넓은 화면·좁은 터미널 모두 대응 |
| Plugins | CLI·소켓 API로 확장 |

에이전트 자동 인식: 프로세스 트리를 따라 Codex·Claude 같은 직접 실행 에이전트는 물론 명령 래퍼까지 탐지해 상태를 잡아낸다.

## 설치

```text
# macOS / Linux (정식)
curl -fsSL https://herdr.dev/install.sh | sh

# Windows (베타 — 실험적)
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

## 함정

- Windows는 베타다. herdr는 본래 Unix PTY(가상 터미널) 모델 위에 만들어져서, Windows에서는 remote attach·직접 terminal attach·라이브 파일 디스크립터 핸드오프 같은 기능에 아직 공백이 있다. 안정적으로 쓰려면 macOS·Linux, 또는 WSL2 권장.
- tmux 대체가 아니라 "에이전트용" 멀티플렉서다. 일반 셸 다중화 목적이면 tmux/zellij가 더 성숙하다.
- 설치 스크립트를 파이프로 바로 셸에 흘려넣는 방식(`curl … | sh`)이라, 사내·민감 환경이라면 스크립트를 먼저 받아 내용을 확인한 뒤 실행하는 편이 안전하다.
