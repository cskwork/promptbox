---
title: Docmost
summary: "Confluence·Notion 대안 오픈소스 협업 위키·문서화 플랫폼. 실시간 공동 편집, Draw.io·Excalidraw·Mermaid 다이어그램, 스페이스 권한 관리, 페이지 이력, 전문 검색을 Docker 한 번으로 자체 호스팅한다."
summary_en: "Open-source collaborative wiki and documentation software — a self-hosted alternative to Confluence and Notion with real-time editing, diagrams, and permissions."
tags: [wiki, documentation, notion-alternative, confluence-alternative, collaboration, self-hosted, docker]
source: https://github.com/docmost/docmost
author: docmost
license: AGPL-3.0
languages: [TypeScript]
platforms: [Docker, Web]
order: 55
install: "docker run -d --name docmost -p 3000:3000 docmost/docmost"
---

## 한 줄

Notion(메모·문서 협업 플랫폼)이나 Confluence(Atlassian 사의 엔터프라이즈 위키)를 자체 서버에 무료로 올릴 수 있는 오픈소스 대안. 실시간 공동 편집(여러 사람이 동시에 같은 문서를 고치는 기능)과 다이어그램 도구를 기본 탑재했다.

## 언제 쓰는가

- 스타트업이나 소규모 팀에서 Notion/Confluence 구독비 없이 자체 위키를 운영하고 싶을 때
- 사내 문서가 외부 클라우드에 저장되면 안 되는 보안·컴플라이언스 환경에서
- 개발팀이 기술 문서, API 문서, 회의록, 온보딩 문서를 한 곳에서 관리할 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| 실시간 협업 | 다중 사용자 동시 편집 |
| 다이어그램 | Draw.io, Excalidraw, Mermaid 임베드 |
| 스페이스 | 프로젝트·팀별 공간 분리 |
| 권한 관리 | 그룹·스페이스 단위 접근 제어 |
| 페이지 이력 | 변경 이력 추적 및 복원 |
| 검색 | Algolia 기반 전문 검색 |
| 첨부 | 파일 업로드 |
| 임베드 | Airtable, Loom, Miro 등 외부 콘텐츠 |
| 다국어 | 10+ 언어 지원 (Crowdin) |

## 설치

```text
# Docker Compose (권장)
git clone https://github.com/docmost/docmost.git
cd docmost
cp .env.example .env
# .env에서 DB 비밀번호 등 설정 후
docker compose up -d

# 단일 컨테이너
docker run -d --name docmost -p 3000:3000 docmost/docmost
```

## 함정

- AGPL-3.0 라이선스 — 자체 호스팅은 자유롭지만, 수정 후 외부에 서비스(SaaS)로 제공하려면 소스 코드를 공개해야 한다. Enterprise 라이선스(유료)로 예외 확보 가능.
- PostgreSQL과 Redis가 필요하다. `docker compose`를 쓰면 함께 뜨지만, 단일 컨테이너 실행 시 별도 구성 필요.
- 21k 스타의 성숙한 프로젝트지만, Notion의 모든 기능(예: 데이터베이스 뷰)을 1:1로 커버하지는 않는다.
