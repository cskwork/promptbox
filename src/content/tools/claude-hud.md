---
title: claude-hud
summary: "Claude Code로 작업할 때 입력창 바로 아래에 진행 상황 한 줄을 띄워 주는 도구 — 대화가 얼마나 찼는지, 무슨 작업이 도는지, 남은 할 일과 git 변경까지 따로 명령 안 쳐도 한눈에 보인다."
summary_en: "A live status line under your Claude Code prompt that shows how full the chat is, what is running, and your pending tasks at a glance."
tags: [tool, claude-code, plugin, hud, statusline, context-monitor, mit]
source: https://github.com/jarrodwatts/claude-hud
author: jarrodwatts
license: MIT
languages: [JavaScript, TypeScript]
platforms: [macOS, Linux, Windows]
order: 20
install: "/plugin marketplace add jarrodwatts/claude-hud && /plugin install claude-hud"
---

## 한 줄

Claude Code 안에서 `/context` 따로 안 쳐도 context bar가 항상 보이고, 어떤 subagent가 어디까지 갔는지·어떤 파일이 읽히는지·todo가 몇 개 남았는지 즉시 보인다.

## 언제 쓰는가

- 긴 세션에서 context window가 얼마나 남았는지 계속 신경 쓰일 때
- subagent를 자주 띄워서 어디가 돌고 있는지 추적이 필요할 때
- Claude 구독 rate limit을 모니터링하고 싶을 때

## 설치

```text
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud
/reload-plugins
/claude-hud:setup
```

요구사항: Claude Code v1.0.80+, Node.js 18+ (또는 Bun).

## 표시 항목

| 항목 | 내용 |
|------|------|
| Project path | 디렉터리 깊이 조절 가능 |
| Context health | progress bar (green → yellow → red) |
| Tool activity | 파일 read/edit/search 실시간 |
| Agent tracking | 실행 중 subagent와 상태 |
| Todo progress | task 완료 카운트 |
| Git status | branch + uncommitted 변경 |
| Usage limits | Claude 구독 rate limit |

## 함정

- Claude Code 버전이 낮으면 statusline API가 달라 작동 안 함 — 반드시 1.0.80 이상
- 설치 직후 `/reload-plugins`와 `/claude-hud:setup` 둘 다 거쳐야 정상 활성화
- HUD가 너무 많은 행을 차지하면 `/claude-hud:configure`에서 표시 항목 토글
