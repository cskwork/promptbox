---
title: codegraph
summary: AI 코딩 도구가 매번 파일을 뒤지지 않도록 코드를 미리 지도처럼 정리해 두는 도구 — 구조 질문에 빨리 답하고 비용도 줄여줍니다. 코드는 내 컴퓨터 밖으로 안 나갑니다.
summary_en: Pre-maps your codebase so AI coding tools answer "where does this live" fast, with fewer lookups and lower cost — and your code never leaves your machine.
tags: [tool, indexer, knowledge-graph, claude-code, codex, cursor, opencode, local, mit]
source: https://github.com/colbymchenry/codegraph
author: colbymchenry
license: MIT
languages: [TypeScript]
platforms: [macOS, Linux, Windows]
order: 10
install: "curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh"
hidden: true
---

## 한 줄

AI 에이전트가 질문할 때마다 코드 전체를 다시 읽느라 비용을 태우는 대신, 미리 만들어 둔 코드 지도를 곧장 조회합니다 — 19개 이상 언어 지원에, Django·Flask·FastAPI·Express·Spring 같은 프레임워크 구조까지 알아서 인식.

*EN: Instead of re-reading your whole codebase on every question, the agent queries a prebuilt map — 19+ languages, framework-aware for Django, Flask, FastAPI, Express, Spring, and more.*

## 언제 쓰는가

- Claude Code, Cursor, Codex, OpenCode, Hermes 에이전트가 큰 repo에서 아키텍처 질문에 답해야 할 때
- 같은 질문에 반복적으로 tool call(에이전트가 도구를 호출하는 횟수)이 늘어나서 비용·시간이 부담될 때
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

- index는 빌드 후 stale(캐시가 낡아 최신 코드와 어긋난 상태) 가능 — 코드 크게 바뀌면 재인덱스 필요
- framework auto-detect가 안 잡으면 routing(경로·엔드포인트 연결 정보) 정보가 빠질 수 있음
- 매우 큰 monorepo(여러 프로젝트를 하나의 저장소에 담은 구조)는 초기 index 시간 길어짐

## 핵심 효과 (저자 측정)

| 지표 | 절감 |
|------|------|
| 토큰 사용 | -35% |
| Tool call 수 | -71% |
| 네트워크 의존 | 0 (완전 로컬) |
