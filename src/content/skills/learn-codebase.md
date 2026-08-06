---
title: learn-codebase
summary: "남이나 AI가 짠 낯선 코드를, 왜 이렇게 짰는지(설계 의도)와 실제 코드를 나란히 짚어 가며 길 잃지 않고 이해하도록 단계별로 안내하는 도구."
summary_en: "Learn any codebase by pairing design intent with implementation, one depth level at a time — stop the moment you know enough to act."
tags: [skill, claude-code, codex, code-review, onboarding, intent]
source: https://github.com/cskwork/learn-codebase
author: cskwork
license: MIT
order: 30
hidden: true
trigger: "AI shipped this PR / there's a 40-page spec and 100 files / onboard junior to one feature / did implementation match spec / scared to change behavior X"
install: "git clone https://github.com/cskwork/learn-codebase ~/.claude/skills/learn-codebase"
---

## 한 줄

코드만 읽으면 **흉내**에 그치고, 설계 문서(스펙)만 읽으면 **추측**에 그친다. 둘을 **나란히** 짚으면 어디를 고쳐도 되는지 자신 있게 안다.

*EN: Read code alone and you only mimic; read the spec alone and you only guess. Pair them and you know what is safe to change.*

## 언제 쓰는가

- AI가 PR을 쳤는데 뭘 한 건지 모르겠을 때
- 40페이지 스펙 + 100개 파일 레포에 처음 들어갈 때
- 주니어에게 *전체 제품*이 아니라 *한 기능*만 가르쳐야 할 때
- 스펙과 구현이 어긋났는지(drift, 문서와 코드가 시간이 지나며 벌어짐) 의심될 때
- 동작 X를 바꿔야 하는데 영향 범위가 무서울 때

## 4단계 (필요한 깊이까지만 멈춰라)

| Level | 예산 | 목표 | 산출물 |
|---|---|---|---|
| 1 Map | ≤5분 | 이게 뭐고 왜 있는가 | 3줄 요약 + entry function(코드가 시작되는 진입 함수) 1개 |
| 2 Walk | ≤30분 | happy path(정상 흐름)가 어떻게 흐르는가 | side-by-side(나란히 비교) 추적 표 (5–10행) |
| 3 Probe | ≤2h | 왜 이렇게 만들었는가 | 의사결정 매트릭스 + 기각된 대안 |
| 4 Master | 깊게 | 무엇이 시스템을 지탱하는가 | 불변식·seam(테스트를 끼워 넣는 이음새) 맵 |

## Plain-Speech Rule (Feynman 모드)

비전공자도 따라올 수 있어야 함. 모든 산출물은 다음 5가지를 지켜야 통과:

1. **첫 줄에 일상 비유 또는 한 줄 plain summary(쉬운 말 요약)**
2. **모든 식별자(FR-001, twin_group 등)는 첫 등장에 괄호 안 풀어 쓰기**
3. **무엇(what)보다 왜(why)를 먼저**
4. **알몸 약어·코드 경로 금지**
5. **마지막에 "If you only read one thing" — 3문장 zero-jargon(전문 용어 없는) 요약**

## Bite-Size Delivery Rule

한 응답 = 한 청크(작게 나눈 한 덩어리). 스크롤 한 번 이상이면 실패. TL;DR(너무 길어 안 읽을까 봐 핵심만 3줄) → 메뉴 (A/B/C/D) → 사용자가 고른 것만 다음 응답.

## 핵심 동작

읽는 코드 chunk마다 그것을 정당화하는 **intent(이렇게 짠 설계 의도)**를 찾고, 양쪽을 한 행에 적는다. 빈 칸이 있으면 그건 **다음에 probe(깊이 파고들어 확인)할 대상**이지, 문제가 아니다.

```
| What this means (plain)         | Intent (cite)    | Code (file:line) | Test/Contract | Why-not (rejected) |
| AI 제안, 사람 승인 (역방향 금지) | spec.md§MVP2원칙 | review.py:42     | test_review.py::T1 | auto-approve (Q1 false-positive 위험) |
```

## 자주 하는 실수

| 실수 | 결과 | 처방 |
|---|---|---|
| 코드를 top-to-bottom으로 읽음 | 문법은 외우지만 목적 놓침 | 스펙 §0 먼저 열기 |
| 스펙만 읽고 코드 안 봄 | 자신 있게 틀림 | 모든 주장에 `file:line` 페어링 |
| 인용 생략 | 나중에 감사·공유 불가 | 항상 `(doc§)` + `(file:line)` |
| 즉시 Level 4로 직진 | 번아웃 + 왜를 놓침 | 과제에 필요한 Level까지만 |
| AI 생성 코드를 스펙으로 취급 | hallucination을 codify | 스펙이 이김. drift 발견하면 flag |
| 한 응답에 모든 Level 덤프 | 독자가 스크롤하다 떠남 | Stage A만, 그 다음 메뉴 |

## 의도(intent)는 어디 있는가

권위 순(높은 것부터): 정식 스펙 문서 → ADR / Clarifications → 계약·스키마 → 테스트 → 이슈 ref가 달린 커밋 메시지 → 이슈 트래커·PR → `CLAUDE.md` / `AGENTS.md`.

## 설치

```bash
git clone https://github.com/cskwork/learn-codebase ~/.claude/skills/learn-codebase
# 또는 작업 디렉토리에 두고 심볼릭 링크
git clone https://github.com/cskwork/learn-codebase ~/code/learn-codebase
ln -s ~/code/learn-codebase ~/.claude/skills/learn-codebase
```

세션에서:

> "Use `learn-codebase` to walk me through feature X."

## SKILL.md 본문 (복사용 — 본문이 길어 핵심만 발췌; 전체는 원본 레포 참조)

````markdown
---
name: learn-codebase
description: Use when learning a codebase another agent (human or AI) has built, reviewing an AI-generated PR against a spec, onboarding to a single feature mid-stream, planning a change to behavior whose blast radius you do not yet know, or diagnosing suspected spec-versus-code drift.
---

# learn-codebase — Intent-Anchored Reading

## Overview
To understand code another agent wrote, anchor every read on the intent that
justifies it. Read intent and code as paired columns, never in sequence.

Code without intent = ritual mimicry.
Intent without code = aspiration.
Side-by-side = bidirectional traceability you can act on.

## Plain-Speech Rule (applies to ALL outputs)
1. Lead with everyday analogy or one-line plain summary before any jargon.
2. Expand every identifier the first time it appears, in parentheses.
3. Translate the why before the what.
4. No naked acronyms, no naked code paths.
5. Close with a 1-minute summary block titled "If you only read one thing" —
   3 sentences max, zero jargon.

## Bite-Size Delivery Rule (applies to ALL outputs)
1. One response = one chunk (≤3-sentence TL;DR + 1 citation).
2. TL;DR first, every time.
3. End every chunk with a "next options" menu — 2 to 4 choices.
4. Cap per chunk: ≤5 headings, ≤8 table rows, ≤1 fenced code block ≤30 lines.
5. Park the rest, don't summarize it.

## When to Use
- "AI shipped this PR last week and I have no idea what it does."
- "There's a 40-page spec and a 100-file repo. Where do I even start?"
- "I need to onboard a junior dev to one feature."
- "Did the implementation actually match what we asked for?"
- "I need to change behavior X but I'm scared of what depends on it."

## The Core Move
For every code chunk you read, find the intent that justifies it. Record both
in a side-by-side row. Cite both. A row with empty cells is a probe target.

| What this means (plain) | Intent (cite) | Code (file:line) | Test/Contract | Why-not |
| ----------------------- | ------------- | ---------------- | ------------- | ------- |
| ...                     | ...           | ...              | ...           | ...     |

## The 4 Levels (stop at the level your task needs)

### Level 1 — Map (≤5 min)
analogy + 3-line plain summary + entry: file:line + menu

### Level 2 — Walk (≤30 min)
trace summary + first 3 rows of side-by-side + menu

### Level 3 — Probe (≤2 h)
top 3 surprising decisions + menu (full matrix on request)

### Level 4 — Master (deep)
top 3 invariants + one-line guardian each + menu

## Where Intent Lives
Authority order: canonical spec docs → ADRs / Clarifications → contracts /
schemas → tests → commit messages with issue refs → issue tracker / PRs →
agent rule files (CLAUDE.md, AGENTS.md).

## Common Mistakes
Reading code top-to-bottom, skipping citations, jumping to Level 4 immediately,
treating AI-generated code as spec, dumping all Levels in one response.

(See https://github.com/cskwork/learn-codebase/blob/main/SKILL.md for the full
text with templates and self-test scenarios.)
````
