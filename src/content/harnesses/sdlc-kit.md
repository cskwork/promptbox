---
title: sdlc-kit
summary: Anthropic AI-Native SDLC 플레이북을 하네스 중립으로 옮긴 파일 기반 SDLC 프레임워크 — 의도 심문, sha256 승인 게이트, 적대적 리뷰, 교훈 메모리
summary_en: Anthropic's AI-Native SDLC playbook made harness-neutral — intent grilling, sha256 tamper-evident approval gates, fresh-context adversarial review, and bounded lessons memory, all as plain files + shell.
tags: [sdlc, workflow, approval-gates, adversarial-review, spec-driven, memory]
source: https://github.com/cskwork/sdlc-kit
author: cskwork
base_agent: "하네스 중립 (pi · Claude Code · Codex CLI · Gemini CLI · Cursor)"
languages: [Markdown, Shell]
platforms: [macOS, Linux, WSL2]
install: "git clone https://github.com/cskwork/sdlc-kit ~/sdlc-kit && cd <project> && ~/sdlc-kit/init.sh"
---

## 한 줄

Anthropic의 AI-Native SDLC 플레이북(intent → spec → plan → build → evidence → maintain 루프)을 특정 하네스 기능(훅, CLAUDE.md, plan mode) 없이 순수 파일 + 셸 스크립트만으로 재구현한 프레임워크. pi, Claude Code, Codex 어디서든 같은 계약으로 돌아간다.

## 언제 쓰는가

- 그린필드든 브라운필드(기존 코드 변경)든, 기능 하나를 아이디어부터 배포 증거까지 게이트 있는 루프로 끌고 가고 싶을 때
- 에이전트가 스펙을 자동 생성하되, 사람은 게이트에서 플래그된 항목만 리뷰하게 만들고 싶을 때
- 같은 실수를 두 번 반복하지 않는 메모리(교훈 파일 + 50줄 인덱스)를 컨텍스트 폭발 없이 원할 때

## 무엇을 하는가

- **6단계 스킬**: 각 단계가 아티팩트 하나를 만들고, 사람 승인이 다음 단계를 연다. 6단계(maintain)는 장애를 진단해 새 `intent.md`를 쓴다 — 루프가 스스로를 먹여 살린다.
- **의도 심문(grill)**: 1단계는 한 번에 한 질문으로 사용자를 심문하고, 모든 주장에 `[verified]`/`[assumed]` 라벨을 붙인다. 사용자가 틀릴 수 있다는 전제로 researcher 서브에이전트가 코드로 반증한다.
- **변조 감지 게이트**: `approve.sh`(사람 전용)가 아티팩트의 sha256+승인자+시각을 기록하고, `check-gate.sh`(에이전트)가 재해시한다. 승인 후 수정하면 게이트가 자동으로 닫힌다. 승인 기록은 기능 슬러그별로 격리된다.
- **신선한 컨텍스트 역할**: verifier(검증) · adversary(적대적 리뷰) · researcher(탐사)가 순수 프롬프트 파일로 제공된다. 서브에이전트가 없는 하네스는 새 세션에 붙여넣으면 된다.
- **함정(gotcha)**: 게이트는 변조 방지(tamper-proof)가 아니라 변조 감지(tamper-evident)다 — git 이력이 감사 추적이다. `.sdlc/config.md`의 빌드/테스트 명령을 채우지 않으면 증거 단계가 공허해진다.

## 구조

````text
sdlc-kit/
├── AGENTS.md            # 라우팅 계약 — 모든 하네스가 읽는 단일 파일
├── init.sh              # 대상 프로젝트에 .sdlc/{work,approvals,memory,config} 시드
├── skills/1-intent … 6-maintain/SKILL.md
├── roles/verifier.md adversary.md researcher.md
├── gates/approve.sh check-gate.sh selftest.sh
└── templates/intent spec plan evidence lesson

# 사용 흐름
you:   "Start SDLC for <idea>"
agent: 심문 → .sdlc/work/<slug>/intent.md
you:   ~/sdlc-kit/gates/approve.sh intent .sdlc/work/<slug>/intent.md
agent: spec(적대 리뷰 후) → 승인 → plan → 승인 → build(verifier) → evidence → ship 승인
````
