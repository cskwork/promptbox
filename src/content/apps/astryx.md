---
title: Astryx
summary: "Meta가 8년간 사내에서 키운 디자인 시스템의 오픈소스화. 150+ 접근성 컴포넌트, 7개 테마, CLI, 다크모드. 사람과 AI 에이전트가 같은 방식으로 UI를 만들도록 설계(agent-ready)되었고, StyleX 기반이지만 소비자는 어떤 CSS 프레임워크와도 호환된다."
summary_en: "Meta's in-house design system, open-sourced — 150+ accessible components, 7 themes, CLI. Built for both humans and AI agents to build UI the same way."
tags: [design-system, react, stylex, meta, component-library, accessible, agent-ready, cli]
source: https://github.com/facebook/astryx
author: Meta
license: MIT
languages: [TypeScript]
platforms: [Web, React, Next.js, Vite]
order: 65
install: "npm install @astryxdesign/core @astryxdesign/theme-neutral"
---

## 한 줄

Meta(구 Facebook) 내부에서 8년간 13,000+ 앱을 만드는 데 쓰인 디자인 시스템(일관된 UI 컴포넌트와 디자인 토큰의 모음)을 오픈소스로 공개. 사람과 AI 에이전트가 같은 툴과 API로 UI를 만들도록 설계(agent-ready)되었다는 점이 다른 디자인 시스템(MUI, Chakra UI 등)과의 차이점.

## 언제 쓰는가

- 스타트업이나 1인 개발자가 일관된 고품질 UI를 빠르게 만들어야 할 때
- AI 에이전트(Claude, Codex 등)에게 UI를 짜게 할 때 — Astryx는 CLI와 문서가 에이전트 친화적으로 설계되어 있어 에이전트가 컴포넌트를 찾고 조합하기 쉽다
- 접근성(a11y, 장애인 접근성)이 중요한 공공·엔터프라이즈 서비스를 만들 때
- Tailwind, CSS Modules, 일반 CSS 등 기존 스타일링 방식을 바꾸지 않고 컴포넌트만 가져다 쓰고 싶을 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| 컴포넌트 | 150+ React 컴포넌트, 전체 TypeScript 지원 |
| 테마 | 7개 기본 테마 (neutral, butter, chocolate, matcha, stone, gothic, y2k) |
| 커스터마이징 | CSS 커스텀 프로퍼티(변수) 오버라이드 — 포크나 래핑 없이 브랜드 적용 |
| Swizzle | 컴포넌트 전체 소스를 프로젝트로 추출(eject)해서 소유 |
| CLI | 컴포넌트 문서, 템플릿, 스캐폴딩, 테마, codemod(대규모 코드 변환) |
| StyleX | 내부적으로 StyleX(Meta의 CSS-in-JS)를 쓰지만 소비자는 빌드 플러그인 불필요 |
| 다크모드 | 기본 지원 |
| 패턴 | 테이블 페이지, 상세 페이지, 폼 위자드, 내비게이션 등 실전 패턴 |
| Agent-ready | API·문서·CLI가 함께 설계되어 사람과 AI가 같은 방식으로 빌드 |

## 설치

```text
# npm
npm install @astryxdesign/core @astryxdesign/theme-neutral
npm install -D @astryxdesign/cli

# pnpm
pnpm add @astryxdesign/core @astryxdesign/theme-neutral
pnpm add -D @astryxdesign/cli

# 가장 간단한 설정 — CSS import + ThemeProvider (빌드 플러그인 불필요)
# Next.js, Tailwind, Vite, CDN 모두 지원

# CLI (AI 에이전트 권장 방식)
npm run astryx -- component --list
```

## 함정

- 현재 Beta(v0.1.x) 단계 — Meta 내부에서는 8년간 검증되었지만, 오픈소스 에코시스템 생태계(서드파티 플러그인, 커뮤니티 템플릿)는 아직 초기.
- React 전용이다. Vue, Svelte, Angular 등 다른 프레임워크에서는 쓸 수 없다.
- StyleX(Meta의 CSS-in-JS 방식) 기반이지만, 소비자 입장에서는 빌드 플러그인이 필요 없다 — 다만 `@astryxdesign/build` 패키지로 StyleX 소스 빌드를 할 수는 있다.
- 150+ 컴포넌트가 전부 동일한 명명·prop 규칙을 따르지만, 학습 곡선이 0은 아니다. CLI의 `component --list`와 문서로 규칙을 익혀야 한다.
