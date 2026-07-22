---
title: archify
summary: "아키텍처·시퀀스·데이터플로·상태 다이어그램을 의존성 없는 단일 HTML 파일로 만든다. 노드를 눌러 관계를 추적하고, 두 지점을 골라 경로를 분석하고, 스토리 순서로 넘겨 보며, PNG·SVG·WebM으로 내보낸다. 평문 설명이나 붙여넣은 Mermaid 코드 둘 다 입력으로 받는다."
summary_en: "Turns plain-language descriptions or pasted Mermaid into explorable standalone HTML diagrams — architecture, sequence, data-flow, lifecycle — with pan/zoom, route probing, story navigation, and PNG/SVG/WebM export."
tags: [skill, diagram, architecture, mermaid, visualization, html, documentation]
source: https://github.com/tt-a1i/archify
author: tt-a1i
license: MIT
order: 30
trigger: "아키텍처 다이어그램 / 시퀀스 다이어그램 / 데이터 파이프라인 그려줘 / use archify to map this repository"
install: "npx skills add tt-a1i/archify -g"
---

## 한 줄

말로 설명하거나 Mermaid 코드를 붙여넣으면, **혼자 열리는 HTML 한 장**으로 탐색 가능한 다이어그램을 만든다. 서버도 빌드도 필요 없다.

*EN: Describe it in plain language or paste Mermaid — get one standalone, explorable HTML file.*

## 언제 쓰는가

- 시스템 아키텍처·인프라·네트워크 토폴로지를 문서에 넣어야 할 때
- API 호출 시퀀스, 요청 수명주기, 승인 플로우, CI/CD 흐름을 보여줄 때
- 데이터 파이프라인·ETL·데이터 리니지·PII 경계를 그릴 때
- 상태 머신·수명주기 다이어그램이 필요할 때
- 이미 있는 Mermaid를 더 읽을 만한 형태로 다시 조판하고 싶을 때

## 무엇을 하는가

| 기능 | 내용 |
|---|---|
| Reading Depth | MAP / READ / FULL 3단계로 정보량을 점진 공개 |
| Semantic Lens | 범례 항목을 고르면 해당 관계만 남기고 방향 신호를 표시 |
| Intent Trace | 클릭 전에 어떤 경로가 강조될지 미리 보여준다 |
| Route Probe | 두 끝점을 골라 그 사이 경로를 분석 |
| Story Navigator | 이야기 순서대로 넘기며 카메라가 따라간다 |
| Shareable Moment | 특정 시점·강조 상태를 URL로 공유 |
| Export | PNG · JPEG · WebP · SVG · WebM |

Mermaid `flowchart` · `sequenceDiagram` · `stateDiagram`을 입력으로 받아 archify 스타일로 **처음부터 다시 배치**한다 — 원본 레이아웃을 그대로 옮기는 게 아니다.

## 함정

- 산출물이 **단일 HTML**이라 편하지만, 그만큼 파일이 커진다. 레포에 커밋할 거라면 `docs/` 아래로 분리하고 diff 노이즈를 감수할지 먼저 정하자.
- 다이어그램 품질은 입력 설명의 구체성에 비례한다. "우리 시스템 그려줘"보다 컴포넌트·경계·방향을 명시한 설명이 훨씬 낫다.
- 코드베이스를 자동 분석해 주는 도구가 아니다. 구조를 알아내려면 `code-review-graph`나 `codebase-memory-mcp` 같은 인덱서로 먼저 파악한 뒤, 그 결과를 archify에 넘기는 조합이 좋다.
