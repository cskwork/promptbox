---
title: orca
summary: 병렬 에이전트 fleet를 다루는 next-gen IDE. Claude Code · Codex · Gemini · 기타 코딩 에이전트를 **사용자 본인의 구독**으로 띄우고, 데스크톱·모바일 양쪽에서 동시 다중 worker로 운영.
tags: [tool, ide, agent-orchestration, parallel-agents, claude-code, codex, gemini, mit]
source: https://github.com/stablyai/orca
author: stablyai
license: MIT
languages: [TypeScript]
platforms: [macOS, Linux, Windows, iOS, Android]
order: 25
install: "https://onOrca.dev 에서 다운로드"
---

## 한 줄

VS Code 같은 single-agent IDE가 아니라, **에이전트 fleet 전용 IDE** — 여러 에이전트(Claude Code, Codex, Gemini)를 worktree별로 띄우고 작업을 분배·관찰·합치는 게 1급 UX.

## 언제 쓰는가

- 한 issue를 여러 변종으로 동시에 시도하고 싶을 때 (각 worker가 worktree)
- 모바일에서 desktop session에 접속해서 worker 상태를 보고 task를 던지고 싶을 때
- vendor API 키 없이 **본인 구독**으로 에이전트들을 돌리고 싶을 때

## 핵심 기능

- **Worktree 기반 worker**: 각 에이전트가 독립 git worktree에서 작업, 충돌 없음
- **다중 에이전트 호스팅**: Claude Code, Codex, Gemini, 그 외 코딩 에이전트
- **본인 구독 사용**: ChatGPT/Claude/Gemini Pro 등 이미 결제한 채널 재활용
- **데스크톱 + 모바일**: 같은 fleet에 양쪽에서 접근
- **에이전트 간 통신 / 코디네이션** primitives 제공

## 설치

[onOrca.dev](https://onOrca.dev)에서 desktop/mobile 빌드 다운로드. 소스: [github.com/stablyai/orca](https://github.com/stablyai/orca).

## 함정

- next-gen이라 stable agent fleet workflow는 아직 진화 중 — feature set 자주 바뀜
- worktree fleet은 디스크 사용량이 커진다 (각 worker가 full checkout)
- 본인 구독 사용 = 그 구독의 rate limit / quota가 그대로 전이됨
