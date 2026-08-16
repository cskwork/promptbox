---
title: prompter
summary: "에이전트가 질문하면 내 과거 결정 패턴으로 답장 초안을 만들어 주고, `y`/`yes`로 확인하기 전에는 절대 보내지 않는다. 낯선 레포에선 `prompt/ explore`가 읽기 전용 탐색으로 다음 작업 프롬프트를 추천한다. 대화 원문이 아니라 재사용 가능한 규칙만 로컬에 저장한다."
summary_en: "Drafts your most likely reply to an agent's question from rules learned on your own machine, and recommends your plausible next prompts in an unfamiliar repo — never sending anything without an explicit y/yes."
tags: [skill, prompt, personalization, privacy, local-first, claude-code, codex, confirmation-gate, repo-exploration]
source: https://github.com/cskwork/prompter
mirror_of: https://raw.githubusercontent.com/cskwork/prompter/main/SKILL.md
author: cskwork
license: MIT
order: 60
trigger: "prompt/ init / prompt/ / prompt/ explore / prompt/ update / 에이전트 질문에 매번 같은 답 타이핑 / 레거시 레포에서 뭘 시킬지 추천"
install: "npx skills@latest add ./prompter"
---

## 한 줄

에이전트가 "유닛 테스트까지만 할까요, 실제 엔드포인트도 칠까요?" 같은 질문을 던질 때마다 같은 답을 다시 타이핑하는 대신, 내 로컬 대화에서 뽑아낸 **결정 규칙(decision rule, 상황에 따라 내가 반복적으로 내리는 판단)** 으로 답장 초안을 만들어 준다. 질문→답변만이 아니라 **내가 에이전트에게 시키는 작업 프롬프트의 패턴**도 학습한다. 그리고 초안은 동의가 아니다 — 화면에 보인 그 문장 그대로에 `y` 또는 `yes`를 받아야만 진행한다.

*EN: Learns how you answer and what you ask for, drafts the reply or the next task prompt, then stops at a hard confirmation gate.*

## 언제 쓰는가

- 같은 취향("완료 전에 실제 API/쿼리 경로로 검증해라")을 세션마다 다시 설명하고 있을 때
- 여러 하네스(harness, 에이전트를 실행하는 CLI 도구)를 오가며 선호가 매번 초기화될 때
- 에이전트가 물어보는데 답이 뻔하지만, 그렇다고 **자동 승인은 절대 원하지 않을 때**
- 컨텍스트 없는 레거시 레포에서 "뭐부터 시킬까"가 막막할 때 — 버그·검증 공백·UX·기능을 근거와 함께 추천받고 싶을 때

네 개의 라우트만 있다. 명시 호출로만 발동하고, 일반 요청에는 끼어들지 않는다.

| 명령 | 하는 일 |
|---|---|
| `prompt/ init [강조점]` | 로컬 세션을 읽기 전용으로 스캔해 첫 프로필 생성 |
| `prompt/` | 지금 미해결인 질문에 답장 후보 1개 제안 후 정지 |
| `prompt/ explore [영역]` | 현재 레포를 읽기 전용 탐색해 다음 작업 프롬프트 추천(관찰 근거 필수, 일반론 금지) |
| `prompt/ update [강조점]` | 바뀐 소스만 증분 스캔해 규칙 갱신 |

## 함정

- **저장되는 건 규칙뿐이다.** 대화 원문·코드·토큰·절대 경로·프로젝트명은 durable(영구 저장) 프로필에 남지 않는다. 임시 증거 파일은 성공·실패와 무관하게 삭제된다.
- **`state.json`은 PC마다 다르다.** 여러 대에서 쓰려면 `profile.json` + `PROFILE.md`만 **프라이빗** 저장소로 동기화한다(`sync --mode pull/push`). `state.json`까지 옮기면 증분 스캔이 오염된다. 두 PC가 갈라지면 자동 병합 없이 멈춘다 — 규칙을 조용히 잃는 것보다 낫다.
- **`explore`는 아무것도 바꾸지 않는다.** 파일 수정·부수효과 명령·네트워크·프로필 기록 전부 금지. 추천은 초안일 뿐, `y`를 받아도 실행 에이전트의 승인 정책은 그대로 적용된다.
- **권한을 추론하지 않는다.** 삭제·배포·결제·자격증명·법률/의료/금융 결정은 학습된 성향으로 승인되지 않는다. 초안은 만들 수 있지만 게이트는 그대로 남는다.
- **"ok", "go", 이모지, 침묵은 동의가 아니다.** 오직 `y`/`yes`만 통과한다.

````markdown
---
name: prompter
description: Infer the user's most likely reply to an agent question from compact, consented decision-pattern evidence, and recommend the development prompts the user would most plausibly send next after a bounded read-only exploration of the current repository. Use only for direct skill invocation or the explicit routes prompt/ init, prompt/, prompt/ explore, and prompt/ update (compact init/explore/update aliases are accepted). Always show the proposed reply and require y/yes before continuing.
license: MIT
compatibility: Requires Python 3.9+ for local session discovery. Works without Python when the user supplies evidence manually.
allowed-tools: Read Grep Glob Bash Task
metadata:
  version: "1.1.0"
  author: cskwork
  invocation: explicit-keyword-or-direct-skill-call
  privacy: local-read-only
  network: none
  state: ~/.prompter
  subagents: preferred
---

# Prompter

Explicit-invocation router for four workflows. Activate only on an exact keyword below or a direct `prompter` invocation. Never infer activation from an ordinary request; never answer an agent question without the confirmation gate.

## Route

Normalize only surrounding whitespace; match literally. Direct invocation with no argument aliases to `prompt/`; direct `init|explore|update <focus>` arguments alias to the keyword routes. Compact aliases (`prompt/init` etc.) are accepted.

Read `references/routes.md` at the matching section, plus the listed files. `references/privacy-and-safety.md` applies to every route.

- `prompt/ init [focus]` → § Init + `references/session-sources.md`, `references/pattern-extraction.md`, `references/profile-and-ranking.md`, `references/profile-sync.md` (only when `~/.prompter` is a git repo with a remote)
- `prompt/` → § Propose + `references/profile-and-ranking.md`, `references/confirmation-gate.md`
- `prompt/ explore [focus]` → § Explore + `references/repo-exploration.md`, `references/profile-and-ranking.md`, `references/confirmation-gate.md`
- `prompt/ update [focus]` → § Update + the same files as Init

## Non-negotiable behavior

1. Session evidence is read-only. Do not modify, resume, compact, export through a network service, or delete source sessions.
2. Persist only compact decision rules and source fingerprints. Never persist full transcripts, copied code, credentials, tool output, or private file contents.
3. Explicit focus supplied with `prompt/init` or `prompt/update` is the strongest evidence.
4. One read-only explorer per detected harness when subagents are available; bounded sequential analysis otherwise.
5. A candidate reply is never consent. Show it and stop.
6. Continue only after an exact case-insensitive `y` or `yes` to the currently displayed, unchanged candidate.
7. Never infer authorization for destructive, irreversible, security-sensitive, production, publishing, purchasing, credential, legal, medical, or financial actions.
8. One concise, context-specific reply — no personality essay, no menu of alternatives.
9. `prompt/explore` is read-only over the current working repository: no file modification, no state-changing commands, no network, nothing persisted into the profile.
10. An exploration recommendation is a draft prompt, never an authorization; accepted candidates start work only under the executing agent's own approval policy.

## Local helper

When shell access is available, use the dependency-free helper (resolve relative to this skill directory) instead of hand-scanning:

```bash
python3 scripts/prompter.py discover
python3 scripts/prompter.py acquire-lock
python3 scripts/prompter.py scan --mode init --output "$TMPDIR/prompter-evidence.json"
python3 scripts/prompter.py scan --mode update --state ~/.prompter/state.json --output "$TMPDIR/prompter-evidence.json"
python3 scripts/prompter.py install-profile --input "$TMPDIR/prompter-profile.json" --lock ~/.prompter/profile.lock --token '<token>'
python3 scripts/prompter.py commit-state --evidence "$TMPDIR/prompter-evidence.json" --state ~/.prompter/state.json
python3 scripts/prompter.py sync --mode pull   # optional; exit 3 = conflict, stop the route
python3 scripts/prompter.py sync --mode push   # optional; exit 4 = push failed, not fatal
python3 scripts/prompter.py release-lock --token '<token>'
```

Hold the update lock from scan through profile installation and state commit; release it in a finally/cleanup path. The helper emits sanitized evidence only — it does not synthesize the profile or submit replies.
````
