---
title: cc-agent-call (cskwork/cc-agent-call)
summary: "지금 쓰는 AI CLI가 다른 도구가 더 잘하는 작업을 만나면 자동으로 그 CLI로 위임하게 해 주는 5개 위임(delegation) 스킬 묶음. 예: Claude Code 안에서 이미지가 필요하면 Codex로 넘겨 생성하고 결과만 받아온다 — 터미널을 안 떠난다."
summary_en: "A bundle of 5 delegation skills that let your current AI CLI auto-hand work off to another tool (Codex for images, Antigravity for grounded search, Kiro, NotebookLM for RAG) — without leaving the host."
tags: [plugin, claude-code, codex, delegation, multi-agent, image-generation, rag, mcp]
source: https://github.com/cskwork/cc-agent-call
author: cskwork
license: MIT
order: 30
harnesses: [Claude Code, Codex CLI]
install: "git clone https://github.com/cskwork/cc-agent-call && cd cc-agent-call && ./install.sh"
---

## 한 줄

비슷한 시기에 나온 여러 agentic CLI(터미널에서 스스로 파일을 읽고 코드를 고치고 명령을 실행하는 AI 도구)는 저마다 잘하는 게 다르다. cc-agent-call은 host(지금 열어 둔 CLI, 보통 Claude Code)가 자기가 못 하는 일을 만나면 다른 CLI로 delegation(위임)하게 해 주는 5개 스킬 묶음이다. install.sh가 각 스킬을 host의 스킬 폴더로 symlink(심링크)해 둔다.

*EN: Each agentic CLI is genuinely better at different things — cc-agent-call lets the one you're in shell out to the right tool and bring the result back.*

## 5개 스킬

| 스킬 | 도는 곳(host) | 빌려오는 능력 | 대표 용도 |
|---|---|---|---|
| `agy-call` | Claude Code | Google Antigravity | 웹 grounding 검색, 이미지 생성, 과학 DB(gnomAD/UniProt/PubMed), 2차 의견 |
| `kiro-call` | Claude Code | AWS Kiro CLI | 자연어→셸 변환, MCP cross-registry, Bedrock 모델 2차 의견 |
| `codex-call` | Claude Code | OpenAI Codex | 고품질 이미지 생성(`gpt-image-2`), 명시적 `codex review` |
| `notebooklm-call` | Claude Code + Codex | Google NotebookLM | PDF/URL/YouTube 코퍼스 RAG(근거 기반 답변), 오디오 요약 |
| `claude-call` | Codex CLI | Claude Code | Codex 사용자가 1M 컨텍스트 plan-mode 기획·대형 코드베이스 리뷰가 필요할 때 |

## 언제 자동 실행되나

의도적으로 좁게 잡아서 깜짝 과금·느린 왕복을 막는다. 둘 중 하나일 때만 발동:

1. 대상 도구를 명시했을 때 — "use agy to search …", "ask codex to …", "have NotebookLM read these PDFs"
2. host가 native로 못 하는 일을 요청했을 때 — 예: Claude Code에 이미지 생성을 요청 → `codex-call` 발동

`review this code` / `plan this feature` 같은 일상 작업은 위임하지 않는다(host가 잘하니까).

## 설치

```bash
git clone https://github.com/cskwork/cc-agent-call
cd cc-agent-call
./install.sh                # 5개 스킬 모두 설치
./install.sh codex-call     # 하나만
./install.sh --dry-run      # 무엇을 링크할지 미리보기
./install.sh --uninstall    # 이 스크립트가 만든 심링크 제거
```

심링크라 repo에서 `git pull`하면 host에 즉시 반영된다. 쓰려는 스킬의 바이너리만 갖추면 됨 — `agy`, `kiro-cli`, `codex`, `notebooklm`, `claude` (각 도구 표준 방식으로 인증, 토큰은 이 repo에 저장 안 함).

## 함정

- 외부 CLI 호출은 보통 별도 토큰/크레딧을 쓴다 — trigger를 좁게 유지하는 이유.
- 설치 후 host CLI를 새 세션으로 열어야 스킬이 auto-load 된다.
- L2/L3 테스트(`RUN_L2=1 ./tests/run-all.sh`)는 실제 모델을 호출해 비용 발생 — CI는 L0/L1만.
