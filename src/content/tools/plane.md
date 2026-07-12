---
title: Plane
summary: "Jira·Linear·Monday·ClickUp 대안 오픈소스 프로젝트 관리 플랫폼. 이슈 트래킹, 스프린트 사이클, 모듈, 커스텀 뷰, 페이지, 실시간 분석 대시보드를 Docker·Kubernetes로 자체 호스팅한다. 54k 스타."
summary_en: "Open-source project management platform — a self-hosted alternative to Jira, Linear, and Monday with issues, cycles, modules, and analytics."
tags: [project-management, jira-alternative, issue-tracker, kanban, sprint, self-hosted, docker, kubernetes]
source: https://github.com/makeplane/plane
author: makeplane
license: AGPL-3.0
languages: [TypeScript, Python]
platforms: [Docker, Kubernetes, Web]
order: 60
install: "curl -fsSL https://docs.plane.so/self-hosting/methods/docker-compose | sh"
---

## 한 줄

Jira(Atlassian의 이슈 트래킹·프로젝트 관리 도구)를 대체하는 오픈소스 프로젝트 관리 플랫폼. 이슈(작업 단위)를 만들고 사이클(스프린트, 짧은 개발 주기)로 묶어 진척도를 번다운 차트로 추적한다. GitHub 54k 스타로, 오픈소스 프로젝트 관리 분야 최대 규모.

## 언제 쓰는가

- 스타트업이나 팀이 Jira 구독비(Jira Cloud는 사용자당 월 $7~) 없이 프로젝트 관리를 하고 싶을 때
- 이슈 트래킹, 스프린트, 칸반 보드, 간트 차트가 필요하지만 도구 자체 관리에 시간을 쓰고 싶지 않을 때
- 데이터를 자체 서버에 두어야 하는 보안 요구사항이 있을 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| Work Items | 리치 텍스트 에디터, 파일 업로드, 하위 속성, 이슈 참조 |
| Cycles | 스프린트 관리 + 번다운 차트 |
| Modules | 대형 프로젝트를 모듈로 분할 |
| Views | 필터 기반 커스텀 뷰, 저장 및 공유 |
| Pages | AI 기능 내장 리치 텍스트 노트 |
| Analytics | 실시간 프로젝트 분석 대시보드 |
| 배포 | Docker Compose, Kubernetes 지원 |
| 인증 | Google, GitHub, Jira, Slack, GitLab 인증 연동 |

## 설치

```text
# Plane Cloud (가장 빠른 시작)
# https://app.plane.so 에서 가입

# Docker 자체 호스팅
curl -fsSL https://docs.plane.so/self-hosting/methods/docker-compose | sh

# Kubernetes
# 배포 가이드: https://developers.plane.so/self-hosting/methods/kubernetes
```

## 함정

- AGPL-3.0 라이선스 — Docmost와 마찬가지로 SaaS로 재배포하려면 소스 공개 의무.
- 자체 호스팅 시 인프라 리소스가 필요하다 (PostgreSQL, Redis, 웹 서버, 웹소켓 서버 등 다수 컨테이너). 최소 4GB RAM 권장.
- Plane Cloud(무료 티어)는 월 300 이슈 제한이 있어, 활발한 팀이라면 자체 호스팅이나 유료 플랜이 필요하다.
- Jira에서 마이그레이션 도구가 있지만, 복잡한 Jira 설정(커스텀 필드, 워크플로우 규칙)은 수동 마이그레이션이 필요할 수 있다.
