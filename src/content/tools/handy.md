---
title: handy
summary: 단축키 한 번 누르고 말하면, 어느 텍스트 필드에든 transcribe된 텍스트가 들어가는 오프라인 데스크톱 STT 앱. 음성을 클라우드로 보내지 않는다 — Whisper / Parakeet V3가 로컬에서 동작.
tags: [tool, speech-to-text, desktop, offline, privacy, whisper, parakeet, mit]
source: https://github.com/cjpais/Handy
author: cjpais
license: MIT
languages: [Rust]
platforms: [macOS, Linux, Windows]
order: 30
install: "brew install --cask handy   # macOS"
---

## 한 줄

ChatGPT 음성 입력이 클라우드 의존인 게 싫고, Apple Dictation은 정확도가 낮을 때 — Handy는 **로컬 Whisper/Parakeet**로 어디든 붙여넣을 수 있는 STT.

## 언제 쓰는가

- 코딩 에이전트 프롬프트를 손이 아니라 음성으로 빠르게 던지고 싶을 때
- 컴플라이언스/프라이버시 이유로 음성을 외부로 보낼 수 없을 때
- 무료 + 오픈소스 alternative가 필요할 때

## 동작

1. 설정한 단축키를 누른 채로 말한다
2. 키를 놓으면 Silero VAD로 음성 구간을 자르고 선택한 모델 (Whisper tiny/base/small/medium/large 또는 Parakeet V3)로 transcribe
3. 결과 텍스트가 활성 텍스트 필드에 paste

## 설치

```bash
# macOS
brew install --cask handy

# Windows
winget install cjpais.Handy

# 또는 GitHub Releases / handy.computer
```

## 핵심 가치

- **Free** — 접근성 도구는 무료여야 한다는 입장
- **Open Source** — 커뮤니티 기여·커스터마이즈 가능
- **Private** — 음성이 사용자 컴퓨터를 떠나지 않음
- **Simple** — 단일 목적: 텍스트 필드에 transcribe

## 함정

- 큰 Whisper 모델은 첫 실행 시 다운로드 + 메모리 사용량 큼 — CPU 약하면 small/base 권장
- 시스템 단축키 권한 (macOS Accessibility, Linux Wayland) 설정 필요
- VAD가 잡음을 음성으로 오인하면 transcribe가 길어지므로 마이크 환경 정돈 권장
