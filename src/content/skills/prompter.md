---
title: prompter
summary: "에이전트가 질문하면 내 과거 결정 패턴으로 답장 초안을 만들어 주고, `y`/`yes`로 확인하기 전에는 절대 보내지 않는다. 대화 원문이 아니라 재사용 가능한 규칙만 로컬에 저장한다."
summary_en: "Drafts your most likely reply to an agent's question from rules learned on your own machine — and never sends it without an explicit y/yes."
tags: [skill, prompt, personalization, privacy, local-first, claude-code, codex, confirmation-gate]
source: https://github.com/cskwork/prompter
author: cskwork
license: MIT
order: 60
trigger: "prompt/ init / prompt/ / prompt/ update / 에이전트 질문에 매번 같은 답 타이핑 / 내 선호대로 답장 초안"
install: "npx skills@latest add ./prompter"
---

## 한 줄

에이전트가 "유닛 테스트까지만 할까요, 실제 엔드포인트도 칠까요?" 같은 질문을 던질 때마다 같은 답을 다시 타이핑하는 대신, 내 로컬 대화에서 뽑아낸 **결정 규칙(decision rule, 상황에 따라 내가 반복적으로 내리는 판단)** 으로 답장 초안을 만들어 준다. 그리고 초안은 동의가 아니다 — 화면에 보인 그 문장 그대로에 `y` 또는 `yes`를 받아야만 진행한다.

*EN: Learns how you usually answer, drafts the reply, then stops at a hard confirmation gate.*

## 언제 쓰는가

- 같은 취향("완료 전에 실제 API/쿼리 경로로 검증해라")을 세션마다 다시 설명하고 있을 때
- 여러 하네스(harness, 에이전트를 실행하는 CLI 도구)를 오가며 선호가 매번 초기화될 때
- 에이전트가 물어보는데 답이 뻔하지만, 그렇다고 **자동 승인은 절대 원하지 않을 때**

세 개의 라우트만 있다. 명시 호출로만 발동하고, 일반 요청에는 끼어들지 않는다.

| 명령 | 하는 일 |
|---|---|
| `prompt/ init [강조점]` | 로컬 세션을 읽기 전용으로 스캔해 첫 프로필 생성 |
| `prompt/` | 지금 미해결인 질문에 답장 후보 1개 제안 후 정지 |
| `prompt/ update [강조점]` | 바뀐 소스만 증분 스캔해 규칙 갱신 |

## 함정

- **저장되는 건 규칙뿐이다.** 대화 원문·코드·토큰·절대 경로·프로젝트명은 durable(영구 저장) 프로필에 남지 않는다. 임시 증거 파일은 성공·실패와 무관하게 삭제된다.
- **`state.json`은 PC마다 다르다.** 여러 대에서 프로필을 공유할 때 이 파일까지 동기화하면 증분 스캔이 오염된다. `profile.json` + `PROFILE.md`만 프라이빗 저장소로 옮긴다.
- **권한을 추론하지 않는다.** 삭제·배포·결제·자격증명·법률/의료/금융 결정은 학습된 성향으로 승인되지 않는다. 초안은 만들 수 있지만 게이트는 그대로 남는다.
- **"ok", "go", 이모지, 침묵은 동의가 아니다.** 오직 `y`/`yes`만 통과한다.

````markdown
---
name: prompter
description: Infer the user's most likely reply to an agent question from compact, consented decision-pattern evidence. Use only for direct skill invocation or the explicit routes prompt/ init, prompt/, and prompt/ update (compact init/update aliases are accepted). Always show the proposed reply and require y/yes before continuing.
license: MIT
compatibility: Requires Python 3.9+ for local session discovery. Works without Python when the user supplies evidence manually.
allowed-tools: Read Grep Glob Bash Task
metadata:
  version: "1.0.1"
  author: cskwork
  invocation: explicit-keyword-or-direct-skill-call
  privacy: local-read-only
  network: none
  state: ~/.prompter
  subagents: preferred
---

# Prompter

An explicit-invocation router for three workflows. Activate only when the current user enters one of the exact keywords below or directly invokes the `prompter` skill. Never infer activation from an ordinary request, and never answer an agent question without the confirmation gate.

## Quick start

```text
User:  prompt/ init Require real API or query verification before calling work done.
       -> read-only scan of local sessions, then ~/.prompter/profile.json + PROFILE.md

Agent: Should I stop at unit tests, or also exercise the endpoint against the dev stack?
User:  prompt/

Prompter:
Proposed prompt
> Exercise the real endpoint against controlled dev data as well. Report the request,
> observed data change, and cleanup result succinctly.

Continue with this prompt? (y/yes or n/no)
```

Nothing is sent until the user answers `y` or `yes` to that exact candidate.

## Route

Normalize only surrounding whitespace. Match the command literally. A direct skill invocation with no route argument aliases to `prompt/`; direct `init <focus>` and `update <focus>` arguments alias to the corresponding keyword routes.

- `prompt/ init [focus]` or compact alias `prompt/init [focus]` → read `references/routes.md` § Init.
- `prompt/` → read `references/routes.md` § Propose.
- `prompt/ update [focus]` or compact alias `prompt/update [focus]` → read `references/routes.md` § Update.

For every route, also apply `references/privacy-and-safety.md`.

For `prompt/`, additionally read:

- `references/profile-and-ranking.md`
- `references/confirmation-gate.md`

For `prompt/init` and `prompt/update`, additionally read:

- `references/session-sources.md`
- `references/pattern-extraction.md`
- `references/profile-and-ranking.md`
- `references/profile-sync.md` (only when `~/.prompter` is a git repository with a remote)

## Non-negotiable behavior

1. Session evidence is read-only. Do not modify, resume, compact, export through a network service, or delete source sessions.
2. Persist only compact decision rules and source fingerprints. Never persist full transcripts, copied code, credentials, tool output, or private file contents.
3. Treat explicit focus supplied with `prompt/init` or `prompt/update` as the strongest evidence.
4. Use one read-only explorer per detected harness when subagents are available. Use bounded sequential analysis otherwise.
5. A candidate reply is never consent. Show it to the user and stop.
6. Continue only after an exact case-insensitive `y` or `yes` to the currently displayed, unchanged candidate.
7. Never infer authorization for destructive, irreversible, security-sensitive, production, publishing, purchasing, credential, legal, medical, or financial actions.
8. Prefer one concise, context-specific reply. Do not produce a personality essay or a menu of verbose alternatives.

## Local helper

When shell access is available, use the dependency-free helper rather than hand-scanning directories:

```bash
python3 scripts/prompter.py discover
python3 scripts/prompter.py acquire-lock
python3 scripts/prompter.py scan --mode init --output "$TMPDIR/prompter-evidence.json"
python3 scripts/prompter.py scan --mode update --state ~/.prompter/state.json --output "$TMPDIR/prompter-evidence.json"
python3 scripts/prompter.py install-profile --input "$TMPDIR/prompter-profile.json" --lock ~/.prompter/profile.lock --token '<token>'
python3 scripts/prompter.py commit-state --evidence "$TMPDIR/prompter-evidence.json" --state ~/.prompter/state.json
python3 scripts/prompter.py release-lock --token '<token>'
```

Resolve `scripts/prompter.py` relative to this skill directory. Hold the update lock from scan through profile installation and state commit, and release it in a finally/cleanup path. The helper emits sanitized evidence; it does not synthesize the profile or submit replies.
````
