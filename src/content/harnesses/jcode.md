---
title: jcode — RAM 효율 최우선 하네스
summary: "Rust로 새로 쓴 터미널 코딩 에이전트. 세션 하나가 30MB 남짓만 쓰고 첫 화면이 수십 ms 안에 뜨기 때문에, 여러 세션을 동시에 켜 두고 일하는 방식이 실제로 가능하다. 이미 결제 중인 Claude·ChatGPT·Gemini·Copilot 구독으로 로그인해 쓸 수 있고, 같은 저장소에서 여러 에이전트가 서로 파일 충돌을 알려 주는 swarm 모드가 들어 있다."
summary_en: "A Rust-built terminal coding agent light enough to keep many sessions open at once — logs in with the Claude, ChatGPT, Gemini, or Copilot subscription you already pay for, and lets several agents share one repo without stepping on each other."
tags: [harness, jcode, coding-agent, rust, swarm, multi-agent, memory, mcp, multi-provider, terminal, low-memory]
source: https://github.com/1jehuang/jcode
author: 1jehuang
license: MIT
order: 20
base_agent: 자체 (독립 하네스)
base_agent_en: Standalone harness
languages: [Rust, TypeScript]
platforms: [macOS, Linux, Windows, WSL2, Termux]
install: "curl -fsSL https://jcode.sh/install | bash   # 또는 brew tap 1jehuang/jcode && brew install jcode"
---

## 한 줄

"가벼워서 여러 개를 동시에 켤 수 있는 하네스." 메모리 사용량과 시작 속도를 1순위로 잡아, 병렬 세션이 예외가 아니라 기본 사용법이 되는 코딩 에이전트.
*EN: Light enough that running many sessions at once is the normal way to use it, not a stunt.*

## 언제 쓰는가

- 저장소 하나에 에이전트를 **여러 개 띄워** 나눠 일을 시키고 싶을 때 — swarm(무리) 모드가 파일 충돌을 서로 알려 준다.
- 노트북이나 원격 서버 자원이 빠듯해서 기존 CLI 에이전트가 무겁게 느껴질 때.
- Claude·ChatGPT/Codex·Gemini·Copilot **구독을 이미 쓰고 있고**, 별도 API 키 결제 없이 그대로 붙이고 싶을 때.
- Codex·Claude Code·opencode·pi에서 하던 **세션을 이어받아** 계속하고 싶을 때.

## 무엇을 하는가

- **낮은 메모리·빠른 시작**: 저자 측정 기준 세션당 약 27.8MB PSS(로컬 임베딩 끔), 첫 프레임 14ms. 자체 측정치이며 독립 검증된 수치는 아니다.
- **swarm 모드**: 같은 저장소의 에이전트들이 서버를 통해 조율된다. A가 파일을 고치면 그 파일을 이미 읽은 B에게 알림이 가고, B는 무시하거나 diff(변경 내역)를 확인한다. 특정 에이전트에게 DM, 서버 전체 브로드캐스트, 같은 저장소 안에서만 알리기가 가능하고, 에이전트가 자기 하위 팀을 띄워 코디네이터 역할을 맡을 수도 있다.
- **메모리**: 대화 턴을 의미 벡터로 임베딩해 그래프에 쌓고, 유사도로 관련 기억을 꺼내 대화에 넣는다. 의미가 멀어지거나(semantic drift) 턴 수가 쌓이거나 세션이 끝날 때 추출이 돌고, ambient 모드는 주기적으로 기억을 정리하며 오래되거나 충돌하는 항목을 점검한다.
- **provider(모델 제공자) 40종+**: Claude, OpenAI/ChatGPT/Codex, Gemini, GitHub Copilot, Azure OpenAI, Ollama, LM Studio, OpenRouter, DeepSeek, Kimi 등 OAuth 로그인 흐름 내장. `/account`로 같은 provider의 계정을 갈아탄다. 헤드리스 환경은 `--no-browser` 또는 `--print-auth-url` → `--callback-url` 2단계 인증.
- **MCP**: `~/.jcode/mcp.json`(전역) / `.jcode/mcp.json`(프로젝트). Claude Code의 MCP 설정을 **스냅샷이 아니라 실시간으로 읽고**, jcode 쪽 파일이 아직 없으면 Codex 설정에서 1회 가져온다. 현재 stdio 서버만 실행되고 http/sse 항목은 로그만 남기고 건너뛴다.
- **스킬**: 미리 다 올려 두지 않고, 대화 임베딩이 의미적으로 맞을 때 자동으로 주입한다. 수동 실행용 스킬 도구와 슬래시 커맨드도 있다.
- **브라우저 자동화**: Firefox Agent Bridge 기반 `browser` 도구 내장(`jcode browser setup`).
- **self dev 모드**: 플러그인 시스템 대신, 에이전트가 자기 바이너리를 직접 고치고 빌드·테스트·핫리로드한다.

## 함정

- **성능 수치는 자체 측정치다.** README의 메모리·시작 속도 비교는 저자가 리눅스 머신 한 대에서 잰 값이다. 내 환경에서 다시 재고 판단하는 게 맞다.
- **MCP 설정 위치가 config.toml이 아니다.** `~/.jcode/config.toml`이 아니라 `~/.jcode/mcp.json`에 따로 산다. config.toml만 고치고 왜 안 붙나 헤매기 쉽다.
- **http/sse MCP 서버는 아직 안 돈다.** 등록해도 조용히 건너뛰므로, 원격 MCP가 필요하면 stdio 브리지를 따로 둬야 한다.
- **Termux는 준비물이 있다**: `pkg install glibc patchelf` 먼저.
- **Claude Code 설정을 실시간으로 읽는다**는 건 양날이다. Claude 쪽 MCP를 고치면 jcode 동작도 같이 바뀐다.
- **self dev 모드는 자기 코드를 고친다.** 프런티어 모델로 쓰라고 권장하는 이유가 있다. 가벼운 모델로 돌리면 하네스 자체가 깨질 수 있다.

## 설치

```bash
# macOS / Linux
curl -fsSL https://jcode.sh/install | bash

# macOS (Homebrew)
brew tap 1jehuang/jcode
brew install jcode

# Windows 11 (PowerShell 5.1+)
irm https://jcode.sh/install.ps1 | iex

# Termux (aarch64 / x86_64) — 선행 조건
pkg install glibc patchelf

# 소스 빌드
git clone https://github.com/1jehuang/jcode.git
cd jcode
cargo build --release
scripts/install_release.sh

# 제거 (--purge 전체 삭제, --dry-run 미리보기)
curl -fsSL https://raw.githubusercontent.com/1jehuang/jcode/master/scripts/uninstall.sh | bash -s -- --yes
```

## 자주 쓰는 명령

```bash
jcode                      # TUI 시작
jcode run "say hello"      # 한 번만 실행
jcode --resume fox         # 이전 세션 이어받기
jcode serve                # swarm 서버
jcode connect              # 실행 중인 서버에 붙기
jcode dictate              # 음성 입력
jcode provider add         # provider 등록 (--api-key-stdin, --api-key-env, --context-window)
jcode browser setup        # Firefox 브라우저 브리지 설정
```

## 주요 경로

```text
~/.jcode/config.toml        메인 설정 ([display], [provider], [providers.<name>])
~/.jcode/mcp.json           전역 MCP 설정
.jcode/mcp.json             프로젝트 MCP 설정
~/.jcode/auth.json          인증 정보
~/.config/jcode/            (Linux) provider 환경변수 파일
```
