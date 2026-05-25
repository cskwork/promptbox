---
title: codegraph
summary: 코드베이스의 심볼·관계를 사전에 인덱싱한 로컬 knowledge graph. 에이전트가 file scan을 반복하지 않고 아키텍처 질문에 빠르게 답하도록 — 토큰 35% 절감, tool call 71% 감소, 100% 로컬, 19+ 언어.
tags: [tool, indexer, knowledge-graph, claude-code, codex, cursor, opencode, local, mit]
source: https://github.com/colbymchenry/codegraph
author: colbymchenry
license: MIT
languages: [TypeScript]
platforms: [macOS, Linux, Windows]
order: 10
install: "curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh"
---

## 한 줄

에이전트가 매번 grep/read로 codebase를 헤집어 토큰을 태우는 대신, 미리 빌드된 semantic graph를 query — 19+ 언어 + framework-aware routing (Django, Flask, FastAPI, Express, Spring 등).

## 언제 쓰는가

- Claude Code, Cursor, Codex, OpenCode, Hermes 에이전트가 큰 repo에서 아키텍처 질문에 답해야 할 때
- 같은 질문에 반복적으로 tool call이 늘어나서 비용·시간이 부담될 때
- 100% 로컬 — 외부 API로 코드가 안 새는 게 중요할 때

## 설치

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex

# npm
npm install -g @colbymchenry/codegraph
```

bundled Node runtime이라 컴파일 불필요.

## 기본 사용

```bash
codegraph init -i                    # 프로젝트 초기화
codegraph index [path]               # knowledge graph 빌드
codegraph query <symbol>             # 심볼 이름으로 검색
codegraph context <task>             # 작업에 관련된 코드 context 가져오기
```

## 함정

- index는 빌드 후 stale 가능 — 코드 크게 바뀌면 재인덱스 필요
- framework auto-detect가 안 잡으면 routing 정보가 빠질 수 있음
- 매우 큰 monorepo는 초기 index 시간 길어짐

## 핵심 효과 (저자 측정)

| 지표 | 절감 |
|------|------|
| 토큰 사용 | -35% |
| Tool call 수 | -71% |
| 네트워크 의존 | 0 (완전 로컬) |
