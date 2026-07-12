---
title: OpenMontage
summary: "세계 최초 오픈소스 에이전트 기반 비디오 제작 시스템. 12개 프로덕션 파이프라인, 52개 툴, 500+ 에이전트 스킬로 AI 코딩 어시스턴트를 영상 제작 스튜디오로 바꾼다. 리서치→스크립트→에셋→편집→렌더 전 과정을 자동화하고, 무료 풋포인지로 실사 영상도 만든다."
summary_en: "The first open-source agentic video production system — 12 pipelines, 52 tools, 500+ agent skills. Turn your AI coding assistant into a full video studio, from research to render."
tags: [video-production, agentic, ai-video, pipeline, remotion, ffmpeg, multi-agent, claude-code]
source: https://github.com/calesthio/OpenMontage
author: calesthio
license: AGPL-3.0
languages: [Python, TypeScript]
platforms: [macOS, Linux, Windows]
order: 80
install: "git clone https://github.com/calesthio/OpenMontage.git && cd OpenMontage && make setup"
---

## 한 줄

"AI 코딩 에이전트를 비디오 제작 스튜디오로" — Claude Code, Cursor, Copilot, Windsurf, Codex 같은 코딩 에이전트에게 영상 제작 능력을 부여하는 오픈소스 시스템. 자연어로 "신경망이 학습하는 과정을 60초 애니메이션으로 만들어줘"라고 하면, 에이전트가 리서치→스크립트→AI 이미지 생성→내레이션→음악→자막→렌더링까지 전 과정을 자동으로 수행한다.

## 언제 쓰는가

- 스타트업이나 개인이 영상 제작팀 없이 마케팅 영상, 제품 데모, 교육 콘텐츠를 만들어야 할 때
- 코딩 에이전트에게 영상 제작을 맡기되, 품질 게이트(슬라이드쇼 감지, 렌더 전 검증, 렌더 후 자기 리뷰)가 있는 체계적인 파이프라인이 필요할 때
- 유료 비디오 생성 API 없이도 무료 스톡 푸티지(Pexels, Archive.org, NASA, Wikimedia)로 실사 영상을 만들고 싶을 때
- 팟캐스트를 쇼츠로 자르거나, 기존 영상에 자막·더빙·번역을 입히는 등 영상 재가공이 필요할 때

## 무엇을 하는가

| 기능 | 내용 |
|------|------|
| 파이프라인 | 12개: 애니메이션 익스플레이너, 시네마틱 트레일러, 다큐멘터리 몽타주, 토킹헤드, 화면 데모, 팟캐스트 재가공, 로컬라이제이션/더빙 등 |
| 툴 | 52개: 비디오 생성(14개 프로바이더), 이미지 생성(10개), TTS(4개), 음악, 자막, 업스케일, 컬러 그레이딩 |
| 에이전트 스킬 | 500+: 파이프라인 단계별 디렉터 스킬, 크리에이티브 기법, 품질 체크리스트 |
| 무료 경로 | Piper TTS(오프라인), 무료 스톡 푸티지, Archive.org/NASA/Wikimedia, 로컬 GPU 비디오 생성(WAN, Hunyuan, CogVideo) |
| 품질 게이트 | 슬라이드쇼 위험 평가(6차원), 렌더 전 검증, 렌더 후 자기 리뷰(ffprobe + 프레임 추출 + 오디오 분석) |
| 비용 관리 | 실행 전 비용 추정, 지출 한도, 단계별 승인 게이트 |
| Backlot | 실시간 라이브 스토리보드 — 파이프라인 진행 상황, 에셋 상태, 비용을 시각화 |
| 참조 영상 | YouTube/Reel/TikTok 링크를 붙여넣으면 분석 후 차별화된 제작 계획 제안 |
| 웹 리서치 | YouTube, Reddit, Hacker News, 뉴스, 학술 출처에서 15-25+ 검색으로 사실 기반 스크립트 |
| 호환 | Claude Code, Cursor, Copilot, Windsurf, Codex — 파일을 읽고 코드를 실행하는 모든 에이전트 |

## 설치

```text
git clone https://github.com/calesthio/OpenMontage.git
cd OpenMontage
make setup

# 전제 조건: Python 3.10+, FFmpeg, Node.js 18+
# brew install ffmpeg  (macOS)
# sudo apt install ffmpeg  (Linux)
```

## 함정

- AGPL-3.0 라이선스 — 수정 후 외부 서비스로 제공하려면 소스 공개 의무.
- 사전 준비물이 많다 — Python 3.10+, FFmpeg, Node.js 18+가 모두 필요. `make setup`이 자동화하지만 환경에 따라 수동 조정이 필요할 수 있다.
- 비디오 생성 API 키(fal.ai, Runway, Kling 등)가 없으면 이미지 기반 영상 또는 무료 스톡 푸티지 경로만 가능. 고품질 AI 비디오 생성은 유료 API가 필요하다(영상당 ~$0.15–$3).
- 로컬 GPU 비디오 생성(WAN 2.1, Hunyuan 등)은 상당한 GPU 메모리가 필요하다.
- 영상 제작 시간이 길다 — 리서치, 에셋 생성, 렌더링 각각 수분~수십분 소요.
