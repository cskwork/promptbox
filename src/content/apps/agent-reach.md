---
title: Agent Reach
summary: "AI 에이전트에게 인터넷 접근 능력을 부여하는 CLI. Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu 등 14개 플랫폼을 읽고 검색한다. API 비용 0원, 모든 도구 오픈소스. 각 플랫폼마다 '首选 + 백업' 다중 백엔드 라우팅으로 한 막히면 자동 전환. 55.2k 스타."
summary_en: "Give your AI agent internet access — read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu and more. One CLI, zero API fees, multi-backend routing per platform."
tags: [agent-infrastructure, web-scraper, internet-access, twitter, reddit, youtube, mcp, cli, claude-code]
source: https://github.com/Panniantong/Agent-Reach
author: Panniantong
license: MIT
languages: [Python]
platforms: [macOS, Linux, Windows]
order: 85
install: "pip install agent-reach && agent-reach install --env=auto"
---

## 한 줄

AI 코딩 에이전트(Claude Code, Cursor, OpenClaw 등)가 웹사이트와 소셜 미디어를 읽고 검색할 수 있게 해주는 인프라 레이어. 각 플랫폼(Twitter, Reddit, YouTube 등)마다 "현재 가장 안정적인 접속 방식"을 선별·설치·진단해 주며, 플랫폼이 접속을 막으면 자동으로 다음 백엔드로 전환된다.

## 언제 쓰는가

- 코딩 에이전트에게 "이 YouTube 영상 요약해 줘", "트위터에서 이 제품 평가 찾아줘", "Reddit에서 같은 버그 겪은 사람 있나?" 같은 웹 조사를 맡기고 싶을 때
- Twitter API(월 $100+), Reddit API 등 유료/승인제 API 없이 소셜 미디어 데이터를 읽어야 할 때
- 중국 플랫폼(Bilibili, XiaoHongShu)의 콘텐츠를 에이전트가 읽을 수 있어야 할 때
- 에이전트에 전문 검색 능력(Exa 시맨틱 검색)을 추가하고 싶을 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| 제로 설정 | 웹(Jina Reader), YouTube(yt-dlp), RSS(feedparser), GitHub(gh), V2EX, 전체 검색(Exa) — 설치만 하면 바로 사용 |
| 설정 후 | Twitter(twitter-cli / OpenCLI), Reddit(OpenCLI / rdt-cli), Bilibili(bili-cli), XiaoHongShu(OpenCLI), Instagram, Facebook, LinkedIn |
| 다중 백엔드 | 각 플랫폼마다 "1순위 + 백업" 후보를 순차 탐지, 첫 번째 사용 가능한 것 자동 선택 |
| 자동 복구 | 백엔드가 막히면 다음 후선으로 전환 (2026-06: yt-dlp가 Bilibility에 차단 → bili-cli로 자동 전환, 사용자 조작 0) |
| 진단 | `agent-reach doctor` — 각 채널의 현재 상태, 사용 중인 백엔드, 문제와 처방을 한눈에 |
| SKILL.md | 에이전트의 skills 디렉토리에 사용 가이드 자동 등록 — 에이전트가 "트위터 검색" 요청을 받으면 어느 툴을 쓸지 안다 |
| 보안 | Cookie/Token은 로컬(`~/.agent-reach/config.yaml`, 권한 600)에만 저장, 업로드하지 않음 |
| 호환 | Claude Code, OpenClaw, Cursor, Windsurf — 명령행을 실행할 수 있는 모든 에이전트 |

## 설치

```text
# AI 에이전트에게 이 한 줄을 복사해 주면 자동 설치
# "帮我安装 Agent Reach：https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/install.md"

# 수동 설치
pip install agent-reach
agent-reach install --env=auto

# 안전 모드 (시스템 패키지 자동 설치 안 함)
agent-reach install --env=auto --safe

# 상태 진단
agent-reach doctor

# 제거
agent-reach uninstall
```

## 함정

- Cookie가 필요한 플랫폼(Twitter, Reddit, XiaoHongShu 등)은 **전용 소계정(sub-account)**을 써야 한다. 메인 계정 사용 시 봇 행위로 간주되어 차단될 위험이 있다.
- Reddit은 익명 접속이 차단되어 반드시 로그인 상태(OpenCLI 또는 rdt-cli + Cookie)가 필요하다. 제로 설정 경로가 없다.
- 서버(클라우드/VM)에 배포할 때만 프록시가 필요하다(~$1/월). 로컬 PC는 프록시 없이 작동.
- 중국어(简体中文)가 기본 언어. 영어/일본어/한국어 README가 있지만 일부 안내는 중국어 원문 기준.
- OpenClaw 사용자는 설치 전 exec 권한을 켜야 한다: `openclaw config set tools.profile "coding"`.
