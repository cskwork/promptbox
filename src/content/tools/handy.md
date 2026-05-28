---
title: handy
summary: "단축키를 누른 채 말하면 그 자리 입력창에 받아쓴 글자가 그대로 들어가는 음성 입력 앱. 목소리는 인터넷으로 안 나가고 내 컴퓨터 안에서만 글로 바뀐다."
summary_en: "Hold a hotkey, speak, and your words land as text in whatever field you're in — voice stays on your machine, never sent to the cloud."
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

ChatGPT 음성 입력이 클라우드 의존인 게 싫고, Apple Dictation은 정확도가 낮을 때 — Handy는 음성을 내 컴퓨터 안에서만 글자로 바꿔(로컬 Whisper/Parakeet) 어느 입력창에든 넣어주는 음성 받아쓰기 도구.
*EN: Local, private voice-to-text that types into any app — no cloud dependency.*

## 언제 쓰는가

- 코딩 에이전트 프롬프트를 손이 아니라 음성으로 빠르게 던지고 싶을 때
- 컴플라이언스/프라이버시 이유로 음성을 외부로 보낼 수 없을 때
- 무료 + 오픈소스 alternative가 필요할 때

## 동작

1. 설정한 단축키를 누른 채로 말한다
2. 키를 놓으면 Silero VAD(음성 활동 감지)로 음성 구간을 자르고 선택한 모델 (Whisper tiny/base/small/medium/large 또는 Parakeet V3)로 transcribe(음성을 글자로 변환)
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
