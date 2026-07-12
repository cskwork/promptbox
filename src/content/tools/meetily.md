---
title: Meetily
summary: "100% 로컬 처리 프라이버시 우선 AI 회의록 툴. Whisper/Parakeet 실시간 전사 + Ollama 로컬 요약. 클라우드 불필요, 회의 데이터가 기기 밖으로 나가지 않는다. macOS·Windows·Linux 지원, 23.4k 스타."
summary_en: "Privacy-first AI meeting assistant — 100% local transcription (Whisper/Parakeet) and summarization (Ollama). No cloud, no data leaves your machine."
tags: [meeting-notes, transcription, whisper, parakeet, ollama, privacy, local-ai, rust, tauri]
source: https://github.com/Zackriya-Solutions/meetily
author: Zackriya-Solutions
license: MIT
languages: [Rust, TypeScript]
platforms: [macOS, Windows, Linux]
order: 70
install: "brew install --cask meetily"
---

## 한 줄

회의 내용을 실시간으로 전사(음성을 텍스트로 바꾸는 것)하고 AI가 자동으로 요약해 주는데, 모든 처리가 내 PC 안에서 100% 로컬로 이루어진다. 클라우드 API(OpenAI Whisper API, Otter.ai 등)에 회의 음성을 보내지 않으니 보안·프라이버시 걱정이 없다. Whisper(OpenAI 음성인식 모델) 또는 Parakeet(NVIDIA 음성인식 모델)를 로컬에서 구동한다.

## 언제 쓰는가

- 회의 내용을 기록·요약하고 싶지만, 회의 음성을 클라우드에 올리면 안 되는 환경(법무, 의료, 국방, 금융, 공공기관)일 때
- Fireflies.ai, Otter.ai, tl;dv 같은 회의록 서비스를 쓰고 있지만 매월 구독비가 부담일 때
- 인터넷 연결이 불안정하거나 오프라인 환경에서도 회의록이 필요할 때
- 회의 후 액션 아이템, 결정 사항, 요약을 자동으로 정리받고 싶을 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| 실시간 전사 | Whisper / Parakeet 로컬 모델, 4x 빠른 처리 |
| AI 요약 | Ollama(로컬 LLM 런타임), Claude, Groq, OpenRouter, 커스텀 OpenAI 호환 엔드포인트 지원 |
| 오디오 믹싱 | 마이크 + 시스템 오디오 동시 녹음, 지능형 더킹(음량 자동 조절) |
| GPU 가속 | macOS: Metal + CoreML, Windows/Linux: CUDA, Vulkan |
| 파일 가져오기 | 기존 오디오 파일을 가져와 전사 (Beta) |
| 화자 분리 | PRO 버전에서 지원 (mid-2026 예정) |
| 데이터 | 모든 데이터(녹음, 전사, 요약)가 로컬에 저장 |

## 설치

```text
# macOS — .dmg 다운로드
# https://github.com/Zackriya-Solutions/meeting-minutes/releases/latest
# meetily_0.4.0_aarch64.dmg

# Windows — installer 다운로드
# 같은 Releases 페이지에서 x64-setup.exe

# Linux — 소스 빌드
git clone https://github.com/Zackriya-Solutions/meeting-minutes
cd meeting-minutes/frontend
pnpm install
./build-gpu.sh
```

## 함정

- 로컬 AI 처리를 위해 충분한 하드웨어가 필요하다. Whisper/Parakeet 모델 구동에 최소 8GB RAM(권장 16GB+), GPU 가속 없이는 실시간 전사가 느릴 수 있다.
- 전사 정확도가 클라우드 API(Whisper Large)보다 낮을 수 있다. Meetily PRO(별매)가 향상된 정확도의 전사 모델을 제공하지만, Community Edition(오픈소스)은 기본 모델만 지원.
- speaker diarization(화자 분리 — 누가 말하는지 구분)이 아직 Community Edition에 없다. 2026년 중 PRO에 추가 예정.
- Whisper.cpp, Screenpipe, transcribe-rs에서 코드를 차용했으므로, 라이선스 충돌이나 의존성 이슈를 확인할 필요는 없다 (MIT).
