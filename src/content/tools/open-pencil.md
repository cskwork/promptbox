---
title: OpenPencil
summary: "오픈소스 AI 네이티브 디자인 에디터 — Figma 대안. .fig 파일을 네이티브로 열고 편집하며, 100+ 툴을 가진 내장 AI, CLI(XPath 쿼리), MCP 서버, 헤드리스 Vue SDK로 코딩 에이전트가 디자인을 직접 조작한다. WebRTC 실시간 협업, ~7MB Tauri 데스크톱 앱."
summary_en: "Open-source AI-native design editor — a Figma alternative that opens .fig files natively, with built-in AI (100+ tools), CLI, MCP server, and Vue SDK for agent-driven design."
tags: [figma-alternative, design-editor, ai-native, mcp, cli, vue, tauri, agent-ready, design-to-code]
source: https://github.com/open-pencil/open-pencil
author: open-pencil
license: MIT
languages: [TypeScript, Vue]
platforms: [macOS, Windows, Linux, Web]
order: 75
install: "brew install openpencil"
---

## 한 줄

Figma(클라우드 기반 디자인 도구)의 폐쇄적 포맷과 프로그래밍 접근 제한에 대응하는 오픈소스 디자인 에디터. Figma의 `.fig` 바이너리 파일을 그대로 열고 편집하며, 100+ 개의 AI 툴과 CLI·MCP 서버를 통해 코딩 에이전트(Claude Code, Codex 등)가 디자인 파일을 프로그래밍으로 조작할 수 있다.

## 언제 쓰는가

- Figma 구독비(월 $15~45/인) 없이 디자인 파일을 열고 편집해야 할 때
- 코딩 에이전트에게 디자인 파일을 읽고 수정하게 하고 싶을 때 — MCP 서버로 100+ 디자인 툴을 에이전트에 연결
- Figma의 CDP(Chrome DevTools Protocol) 디버깅이 막혀 자동화가 깨졌을 때 대안이 필요할 때
- 디자인 토큰 추출, `.fig` → JSX/Tailwind 변환, HTML/CSS → `.fig` 역변환 등 디자인-코드 파이프라인이 필요할 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| 파일 호환 | `.fig` (Figma), `.pen` (Pencil) 읽기/쓰기, 앱 간 노드 복사 |
| AI 빌드 | 채팅으로 디자인 생성·수정, 100+ 툴, OpenRouter/Anthropic/OpenAI/Google AI 연동 |
| CLI | 노드 트리 탐색, XPath 쿼리, export(PNG/JPG/SVG/JSX/HTML), lint, 디자인 토큰 분석 |
| MCP 서버 | Claude Code, Cursor, Windsurf에 100+ 디자인 툴 연결 (stdio + HTTP) |
| 코딩 에이전트 | Claude Code, Codex, Gemini CLI 데스크톱 패널에서 직접 사용 |
| Figma Plugin API | `eval` 명령으로 Figma Plugin API 스크립팅 |
| 협업 | WebRTC P2P 실시간 공동 편집 (서버·계정 불필요) |
| 레이아웃 | Yoga WASM 기반 flex + CSS Grid |
| Vue SDK | 헤드리스 컴포넌트·컴포저블로 커스텀 에디터 임베드 |
| 변환 | `.fig` ↔ JSX/Tailwind, HTML/CSS/Tailwind → `.fig` 역변환 |
| 데스크톱 | Tauri v2, ~7MB, macOS/Windows/Linux |

## 설치

```text
# macOS (Homebrew)
brew install openpencil

# 또는 Releases에서 다운로드
# https://github.com/open-pencil/open-pencil/releases/latest

# 웹 데모 (설치 불필요)
# https://app.openpencil.dev/demo

# CLI
npm install -g @open-pencil/cli

# MCP 서버
npm install -g @open-pencil/mcp
claude mcp add --scope user open-pencil -- openpencil-mcp
```

## 함정

- 활발한 개발 중(v0.13.x) — "사용 가능하지만 거친 부분이 있다(rough edges)"고 프로젝트가 명시한다.
- Figma의 모든 기능을 1:1로 커버하지 않는다. 복잡한 컴포넌트 변수, 고급 프로토타이핑 등에 호환성 갭이 있다.
- MCP 서버의 파일 접근 범위를 `OPENPENCIL_MCP_ROOT`로 스코프하지 않으면, 에이전트가 임의 경로의 파일을 열 수 있다.
- Vue 3 전용이다. React/Svelte 등 다른 프레임워크에서 Vue SDK를 직접 쓸 수 없다.
