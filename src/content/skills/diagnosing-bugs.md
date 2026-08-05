---
title: diagnosing-bugs
summary: "잡히지 않는 버그와 갑자기 느려진 코드를 6단계로 체계적으로 잡는 디버깅 안내서. 재현 테스트를 만들고 최소로 줄이는 것부터 원인 분석, 수정, 재발 방지까지 다룬다."
summary_en: "Playbook for hard bugs and slow regressions: build a repeatable test, shrink it to the smallest failing case, trace the cause, fix it, lock it in."
tags: [skill, debugging, performance, regression, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnosing-bugs
author: mattpocock
license: mattpocock/skills 참조
order: 26
trigger: "diagnose this / debug this / 버그 분석 / 성능 회귀 / something is broken/throwing/failing"
install: "npx skills add https://github.com/mattpocock/skills --skill diagnosing-bugs"
---

## 한 줄

**이 스킬의 핵심은 Phase 1 — "버그를 자동으로 재현하는 테스트"를 먼저 만드는 것이다.** 빠르고 매번 똑같이 통과/실패를 보여주는 deterministic(매번 같은 결과) 신호 하나만 만들면 나머지는 기계적으로 풀린다. 코드를 노려본다고 버그가 잡히지는 않는다.

*EN: The whole skill is Phase 1 — build a test that reproduces the bug on demand; once you have a fast, repeatable pass/fail signal, the rest is mechanical.*

> **이름이 바뀌었습니다.** 원래 `diagnose`였고 업스트림에서 `diagnosing-bugs`로 개명됐습니다. 예전 이름으로 설치돼 있다면 다시 설치해야 합니다.

## 6단계 흐름

1. **Feedback loop(피드백 루프, 고치고 바로 확인하는 순환) 구축** — failing test(실패하는 테스트), curl 스크립트, CLI diff, headless browser(화면 없이 도는 브라우저), capture replay(기록 후 재생), throwaway harness(버리는 테스트 골격), fuzz(무작위 입력 대량 투입), bisection(이분 탐색으로 원인 커밋 찾기), differential(두 버전 출력 비교), HITL(사람이 개입하는 루프) 스크립트 — 이 순서로 시도. 30초 flaky(됐다 안 됐다 하는)보다 2초 deterministic이 superpower.
   완료 조건은 **이미 한 번 실행해 본 명령 하나**를 댈 수 있는 것 — 그 명령이 red-capable(이 버그에서 실제로 빨간불이 뜸)·deterministic·빠름·에이전트 단독 실행 가능이어야 한다.
2. **재현 + 최소화** — 사용자가 말한 그 failure mode(실패 양상)인지, 여러 번 reproducible한지, exact symptom(정확한 증상)을 캡처했는지 확인. 그다음 **여전히 빨간불이 뜨는 가장 작은 시나리오로 줄인다** — 입력·호출부·설정·데이터·단계를 **하나씩** 빼고 매번 다시 돌려서, 남은 요소가 전부 load-bearing(빼면 초록이 되는)일 때까지. 이래야 3단계의 가설 공간이 좁아지고, 그 최소 재현이 5단계의 회귀 테스트가 된다.
3. **가설 3~5개 랭킹** — 단일 가설은 anchoring(첫 가설에 갇히는 편향). 각 가설은 falsifiable(반증 가능한)해야 함 ("X가 원인이면, Y를 바꾸면 사라질 것"). 사용자에게 보여주고 도메인 지식으로 re-rank(다시 순위 매기기).
4. **Instrument(계측, 측정 코드 심기)** — 가설별로 한 변수만 변경. debugger > targeted log(표적 로그) > everything-log(전부 찍기). 모든 debug log에 unique prefix(고유 접두어)(`[DEBUG-a4f2]`) — 끝에 grep 한 번으로 청소.
5. **Fix + regression test(회귀 테스트)** — correct seam(테스트를 끼워 넣는 이음새)이 있을 때만 regression test 먼저 작성. seam 부재 자체가 architecture finding이다.
6. **Cleanup + post-mortem(사후 분석)** — 원본 repro(재현) 사라졌는지, regression test 통과하는지, `[DEBUG-...]` 모두 제거, throwaway 삭제, 맞은 가설을 commit message에 기록. 그리고 "이걸 막을 architecture는?" 묻고 필요시 `/improve-codebase-architecture`로 핸드오프.

## 함정

- Loop 없이 Phase 2로 진행하지 말 것. **코드를 읽어 이론부터 세우고 있다면 그게 이 스킬이 막으려는 바로 그 실패다.** Loop 구축이 불가능하면 멈추고 명시적으로 말하라 — 환경 access, captured artifact(캡처해둔 자료), 또는 임시 production instrumentation(운영 환경 계측) 권한을 요청.
- **재현만 하고 최소화를 건너뛰지 말 것.** 줄이지 않은 재현은 용의자가 너무 많다.
- Non-deterministic(매번 결과가 달라지는) 버그는 "깨끗한 repro"가 아니라 **재현율 상승**이 목표. 50% flake는 debugging 가능, 1%는 불가능.
- 성능 회귀는 log가 잘못된 도구. 먼저 baseline measurement(기준 측정값).

## 원문 SKILL.md (전문)

```markdown
---
name: diagnosing-bugs
description: Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.
---

# Diagnosing Bugs

A discipline for hard bugs. Skip phases only when explicitly justified.

When exploring the codebase, read `CONTEXT.md` (if it exists) to get a clear mental model of the relevant modules, and check ADRs in the area you're touching.

## Phase 1 — Build a feedback loop

**This is the skill.** Everything else is mechanical. If you have a **tight** pass/fail signal for the bug — one that goes red on _this_ bug — you will find the cause; bisection, hypothesis-testing, and instrumentation all just consume it. If you don't have one, no amount of staring at code will save you.

Spend disproportionate effort here. **Be aggressive. Be creative. Refuse to give up.**

### Ways to construct one — try them in roughly this order

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) — drives the UI, asserts on DOM/console/network.
5. **Replay a captured trace.** Save a real network request / payload / event log to disk; replay it through the code path in isolation.
6. **Throwaway harness.** Spin up a minimal subset of the system (one service, mocked deps) that exercises the bug code path with a single function call.
7. **Property / fuzz loop.** If the bug is "sometimes wrong output", run 1000 random inputs and look for the failure mode.
8. **Bisection harness.** If the bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" so you can `git bisect run` it.
9. **Differential loop.** Run the same input through old-version vs new-version (or two configs) and diff outputs.
10. **HITL bash script.** Last resort. If a human must click, drive _them_ with `scripts/hitl-loop.template.sh` so the loop is still structured. Captured output feeds back to you.

Build the right feedback loop, and the bug is 90% fixed.

### Tighten the loop

Treat the loop as a product. Once you have _a_ loop, **tighten** it:

- Can I make it faster? (Cache setup, skip unrelated init, narrow the test scope.)
- Can I make the signal sharper? (Assert on the specific symptom, not "didn't crash".)
- Can I make it more deterministic? (Pin time, seed RNG, isolate filesystem, freeze network.)

A 30-second flaky loop is barely better than no loop; a 2-second deterministic one is tight — a debugging superpower.

### Non-deterministic bugs

The goal is not a clean repro but a **higher reproduction rate**. Loop the trigger 100×, parallelise, add stress, narrow timing windows, inject sleeps. A 50%-flake bug is debuggable; 1% is not — keep raising the rate until it's debuggable.

### When you genuinely cannot build a loop

Stop and say so explicitly. List what you tried. Ask the user for: (a) access to whatever environment reproduces it, (b) a captured artifact (HAR file, log dump, core dump, screen recording with timestamps), or (c) permission to add temporary production instrumentation. Do **not** proceed to hypothesise without a loop.

### Completion criterion — a tight loop that goes red

Phase 1 is done when the loop is **tight** and **red-capable**: you can name **one command** — a script path, a test invocation, a curl — that you have **already run at least once** (paste the invocation and its output), and that is:

- [ ] **Red-capable** — it drives the actual bug code path and asserts the **user's exact symptom**, so it can go red on this bug and green once fixed. Not "runs without erroring" — it must be able to _catch this specific bug_.
- [ ] **Deterministic** — same verdict every run (flaky bugs: a pinned, high reproduction rate, per above).
- [ ] **Fast** — seconds, not minutes.
- [ ] **Agent-runnable** — you can run it unattended; a human in the loop only via `scripts/hitl-loop.template.sh`.

If you catch yourself reading code to build a theory before this command exists, **stop — jumping straight to a hypothesis is the exact failure this skill prevents.** No red-capable command, no Phase 2.

## Phase 2 — Reproduce + minimise

Run the loop. Watch it go red — the bug appears.

Confirm:

- [ ] The loop produces the failure mode the **user** described — not a different failure that happens to be nearby. Wrong bug = wrong fix.
- [ ] The failure is reproducible across multiple runs (or, for non-deterministic bugs, reproducible at a high enough rate to debug against).
- [ ] You have captured the exact symptom (error message, wrong output, slow timing) so later phases can verify the fix actually addresses it.

### Minimise

Once it's red, shrink the repro to the **smallest scenario that still goes red**. Cut inputs, callers, config, data, and steps **one at a time**, re-running the loop after each cut — keep only what's load-bearing for the failure.

Why bother: a minimal repro shrinks the hypothesis space in Phase 3 (fewer moving parts left to suspect) and becomes the clean regression test in Phase 5.

Done when **every remaining element is load-bearing** — removing any one of them makes the loop go green.

Do not proceed until you have reproduced **and** minimised.

## Phase 3 — Hypothesise

Generate **3–5 ranked hypotheses** before testing any of them. Single-hypothesis generation anchors on the first plausible idea.

Each hypothesis must be **falsifiable**: state the prediction it makes.

> Format: "If <X> is the cause, then <changing Y> will make the bug disappear / <changing Z> will make it worse."

If you cannot state the prediction, the hypothesis is a vibe — discard or sharpen it.

**Show the ranked list to the user before testing.** They often have domain knowledge that re-ranks instantly ("we just deployed a change to #3"), or know hypotheses they've already ruled out. Cheap checkpoint, big time saver. Don't block on it — proceed with your ranking if the user is AFK.

## Phase 4 — Instrument

Each probe must map to a specific prediction from Phase 3. **Change one variable at a time.**

Tool preference:

1. **Debugger / REPL inspection** if the env supports it. One breakpoint beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

**Tag every debug log** with a unique prefix, e.g. `[DEBUG-a4f2]`. Cleanup at the end becomes a single grep. Untagged logs survive; tagged logs die.

**Perf branch.** For performance regressions, logs are usually wrong. Instead: establish a baseline measurement (timing harness, `performance.now()`, profiler, query plan), then bisect. Measure first, fix second.

## Phase 5 — Fix + regression test

Write the regression test **before the fix** — but only if there is a **correct seam** for it.

A correct seam is one where the test exercises the **real bug pattern** as it occurs at the call site. If the only available seam is too shallow (single-caller test when the bug needs multiple callers, unit test that can't replicate the chain that triggered the bug), a regression test there gives false confidence.

**If no correct seam exists, that itself is the finding.** Note it. The codebase architecture is preventing the bug from being locked down. Flag this for the next phase.

If a correct seam exists:

1. Turn the minimised repro into a failing test at that seam.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run the Phase 1 feedback loop against the original (un-minimised) scenario.

## Phase 6 — Cleanup + post-mortem

Required before declaring done:

- [ ] Original repro no longer reproduces (re-run the Phase 1 loop)
- [ ] Regression test passes (or absence of seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed (`grep` the prefix)
- [ ] Throwaway prototypes deleted (or moved to a clearly-marked debug location)
- [ ] The hypothesis that turned out correct is stated in the commit / PR message — so the next debugger learns

**Then ask: what would have prevented this bug?** If the answer involves architectural change (no good test seam, tangled callers, hidden coupling) hand off to the `/improve-codebase-architecture` skill with the specifics. Make the recommendation **after** the fix is in, not before — you have more information now than when you started.
```
