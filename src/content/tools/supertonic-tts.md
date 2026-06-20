---
title: supertonic-tts
summary: 터미널 한 줄로 텍스트를 WAV 음성 파일로 바꿔 주는 로컬 TTS CLI — API 키 없이, 모델이 내 컴퓨터에서 직접 실행됩니다.
summary_en: A zero-API-key CLI that turns text into a 44.1 kHz WAV file locally using the Supertonic 3 ONNX model — no cloud round-trips after the first download.
tags: [tts, cli, local, onnx, text-to-speech, offline, node, mit]
source: https://github.com/cskwork/supertonic-tts
author: cskwork
license: MIT
languages: [JavaScript]
platforms: [macOS, Linux, Windows]
order: 30
install: "npm install -g github:cskwork/supertonic-tts"
---

## 한 줄

`supertts "안녕하세요"` 한 번이면 끝 — TTS(text-to-speech, 글자를 음성으로 변환하는 기술) 모델이 내 컴퓨터에서 직접 돌아서 텍스트가 클라우드로 나가지 않습니다. 첫 실행 때 ONNX(Open Neural Network Exchange, 여러 런타임에서 돌아가는 AI 모델 포맷) 모델 가중치 약 380 MB를 자동으로 받아 캐시하고, 이후 실행은 빠릅니다.

## 언제 쓰는가

- 영어·한국어·일본어(외 29개 언어 태그) 텍스트를 바로 WAV 파일로 만들고 싶을 때
- API 키나 유료 구독 없이 오프라인 환경에서 TTS가 필요할 때
- 파이프(`echo "..." | supertts`) 또는 파일 입력(`-f script.txt`)으로 배치 변환을 자동화할 때
- 에이전트나 CI에서 `--no-play --quiet` 플래그로 음성을 무음 생성하고 경로만 받아 쓸 때
- WebGPU(최신 브라우저 GPU 가속 API) 없이도 WASM(WebAssembly, 브라우저·서버에서 돌아가는 이진 포맷) 폴백으로 웹 앱도 함께 제공

## 무엇을 하는가 / 함정

CLI(`supertts` / `supertonic-tts`)와 Vite 기반 웹 앱이 같은 패키지에 들어 있습니다. `npm install -g`로 설치하면 CLI만 전역 등록됩니다.

- **목소리 6종**: F1 Mina · F2 Sora · F3 Yuna (여성), M1 Aiden · M2 Hiro · M3 Leo (남성). 모든 목소리가 모든 언어 태그와 호환됩니다.
- **기본 재생**: 합성이 끝나면 플랫폼 기본 플레이어로 즉시 재생(블로킹). 에이전트·배치에서는 `--no-play` 필수.
- **첫 실행 대기**: 최초 합성 시 ~380 MB 다운로드 — 미리 받으려면 `supertts --download`.
- **한국어·일본어 속도**: 빠르게 들리면 `--speed 0.95` 내외로 낮추세요.
- **중국어(`zh`) 미지원**: Supertonic 3 모델이 지원하지 않습니다.
- **에이전트용 `supertts` SKILL.md** (`skills/supertts/SKILL.md`)도 함께 번들되어 있어 Claude Code 등 에이전트가 직접 TTS를 호출하는 워크플로에 드롭인으로 사용할 수 있습니다.

````bash
# 전역 설치 (Windows / macOS / Linux, Node >= 18.3 필요)
# npm 레지스트리 게시 전이라 GitHub 저장소에서 직접 설치합니다
npm install -g github:cskwork/supertonic-tts

# 기본 사용 — 언어 자동 감지 (ko / ja / en)
supertts "Hello from Supertonic!"
supertts "안녕하세요"
supertts "こんにちは" --voice M1

# 플래그 지정
supertts -t "Hi there" -o hi.wav --voice F2
supertts -f input.txt --lang ko -o out.wav
echo "piped text" | supertts -o piped.wav

# 배치 / 에이전트: 재생 없이 경로만 받기
OUT=$(supertts "audio test" --quiet --no-play)
echo "wrote $OUT"

# 첫 실행 전 모델 가중치만 미리 다운로드
supertts --download

# 목소리 · 언어 목록 확인
supertts --list-voices
supertts --list-langs

# 주요 플래그
# -t, --text <s>      인라인 텍스트 (위치 인수로도 가능)
# -f, --file <p>      .txt 파일 읽기
# -o, --out <p>       출력 WAV 경로 (기본: ./out-<timestamp>.wav)
# -l, --lang <code>   언어 태그 (기본: 자동 감지)
# -v, --voice <id>    F1–F3 / M1–M3 (기본: F1)
# -s, --speed <n>     0.7 – 1.8 (기본: 1.05)
#     --steps <n>     품질 스텝 4 – 16 (기본: 8)
#     --silence <s>   청크 간 무음 (초, 기본: 0.3)
#     --assets <dir>  모델 캐시 디렉터리 지정
#     --no-play       재생 생략
# -q, --quiet         진행 로그 억제

# 모델 캐시 위치
# Windows : %LOCALAPPDATA%\supertonic-tts\assets
# macOS   : ~/Library/Caches/supertonic-tts/assets
# Linux   : $XDG_CACHE_HOME/supertonic-tts/assets (또는 ~/.cache/...)
# 환경변수로 덮어쓰기: SUPERTONIC_ASSETS=/path/to/dir
````
