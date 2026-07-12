---
title: rhwp
summary: "Rust + WebAssembly 기반 오픈소스 HWP/HWPX 뷰어·에디터. 브라우저, VS Code, CLI 어디서든 한글 문서를 열고 편집한다. 한컴 호환 레이어(hwpctl)와 수식·표·차트 렌더링을 갖췄고, 1,100+ 테스트로 정합성을 검증한다."
summary_en: "Open-source HWP/HWPX viewer and editor built on Rust + WASM — open, edit, and render Korean word-processor documents anywhere: browser, VS Code, or CLI."
tags: [hwp, hwpx, korean, document, viewer, editor, wasm, rust, browser]
source: https://github.com/edwardkim/rhwp
author: edwardkim
license: MIT
languages: [Rust, TypeScript, WebAssembly]
platforms: [Web, VS Code, Chrome, Firefox, Edge, iOS, macOS, Linux, Windows]
order: 50
install: "npx @rhwp/cli export-svg input.hwp --out output/"
---

## 한 줄

"알(R), 모두의 한글" — 닫힌 포맷인 HWP/HWPX(한글과컴퓨터의 문서 형식)를 Rust(시스템 프로그래밍 언어)와 WebAssembly(브라우저에서 실행되는 바이너리, 줄여서 WASM)로 풀어, 설치 없이 브라우저에서 열고 편집할 수 있게 한 오픈소스 프로젝트. CLI(명령줄 도구), VS Code 확장, Chrome/Firefox/Edge 확장, iOS 앱까지 폭넓게 지원한다.

## 언제 쓰는가

- 한컴(HWP)이 설치되지 않은 환경 — Mac, Linux, Chromebook, 다른 사람 PC — 에서 `.hwp` / `.hwpx` 파일을 열어봐야 할 때
- 공공기관·학교에서 받은 HWP 문서를 브라우저에서 바로 읽거나 PDF로 내보내야 할 때
- AI 에이전트(Claude, Codex 등)에게 HWP 문서 내용을 읽게 하거나, VLM(시각 언어 모델)용으로 문서 페이지를 PNG로 렌더해야 할 때
- VS Code 안에서 HWP 문서를 미리보며 작업할 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| 파싱 | HWP 5.0 바이너리(OLE2), HWPX(XML) 전 포맷 |
| 렌더링 | 문단·표·수식·이미지·차트, 다단 레이아웃, 머리말/꼬리말, 각주/미주 |
| 편집 | 웹 에디터 + hwpctl(한컴 웹기안기 호환) API — 30종 Action, Field API |
| 출력 | SVG export(CLI), Canvas 렌더링(WASM/Web), PDF export, PNG export(native Skia) |
| 확장 | VS Code 확장, Chrome/Edge/Firefox 브라우저 확장, iOS 앱(AlHangeul) |
| npm | `@rhwp/core`, `@rhwp/editor` — 웹에디터 3줄 임베드 |
| AI 연동 | `--vlm-target claude` 옵션으로 VLM용 PNG export 파이프라인 내장 |

## 설치

```text
# 웹 데모 (설치 불필요)
# https://edwardkim.github.io/rhwp/

# npm — 웹 에디터 임베드
npm install @rhwp/editor

# CLI 바이너리 — GitHub Releases에서 다운로드
# macOS / Linux / Windows 바이너리 + SHA-256 체크섬

# VS Code 확장
# 마켓플레이스에서 "rhwp" 검색

# Docker
docker pull ghcr.io/edwardkim/rhwp:latest
```

## 함정

- 아직 v0.7.x 단계(뼈대~조판)로, 한컴 편집기와 100% 동일한 조판 품질에는 도달 중이다. 복잡한 문서에서 미세한 렌더링 차이가 있을 수 있다.
- HWPX → HWP 변환 저장 경로는 아직 완성 중(#197)이어서, HWPX 출처 문서는 저장이 비활성화되어 있다.
- `curl … | sh` 식 설치가 아니라 npm/바이너리 다운로드 방식이므로 비교적 안전하지만, Docker 이미지 사용 시 공식 레지스트리 출처인지 확인한다.
