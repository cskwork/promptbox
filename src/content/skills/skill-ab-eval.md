---
title: skill-ab-eval (cskwork/skill-ab-eval)
summary: "SKILL.md이 실제로 행동을 바꾸는지(있을 때 vs 없을 때 비교)와, 어떤 CLI 에이전트(claude·codex·gemini·agy·openai)가 그 작업을 더 잘하는지를, 같은 프롬프트를 격리된 새 컨텍스트에서 돌려 심판이 채점하게 해 실증하는 평가 하네스. skill-lift 표 + 하네스 리더보드를 뽑아준다."
summary_en: "An eval harness that empirically measures whether a SKILL.md changes behavior (with vs without) and which CLI agent does a task best — same prompt, isolated fresh contexts, judged and scored into a lift table and leaderboard."
tags: [skill, evaluation, ab-test, benchmark, claude-code, codex, gemini, harness]
source: https://github.com/cskwork/skill-ab-eval
author: cskwork
license: MIT
order: 26
trigger: "evaluate skill · does my skill work · skill A/B · compare CLIs · claude vs codex vs gemini"
install: 'git clone https://github.com/cskwork/skill-ab-eval && ln -s "$(pwd)/skill-ab-eval" ~/.claude/skills/skill-ab-eval'
hidden: true
---

## 한 줄

스킬과 하네스(에이전트 실행 환경)를 "느낌"이 아니라 숫자로 검증하는 도구. 같은 task를 ① 스킬 있을 때 vs 없을 때(baseline·기준선), ② 여러 CLI 에이전트에 걸쳐 각각 fresh context(빈 새 맥락)로 돌리고, judge(심판) 에이전트가 채점해 skill-lift(스킬이 점수를 얼마나 올렸나) 표와 하네스 순위를 만든다.

*EN: Prove what actually works — does the skill help, and which CLI is best for this task — with isolated runs, a blind judge, and real numbers.*

## 언제 쓰는가

- 새 스킬 출시 전: 정말 효과가 있는지, 어느 하네스에서 잘 듣는지 증명
- 스킬 라이브러리 감사: lift가 0이거나 음수인(오히려 해로운) dead weight 스킬 색출
- 도메인별 최적 CLI 선택: "SQL은? 커밋 메시지는? React는 누가 제일 잘해?"

## 함정

- cell(매트릭스 한 칸)마다 반드시 격리된 새 컨텍스트 — 자기 컨텍스트에서 돌리면 스킬이 baseline에 새어들어 결과가 깨진다.
- judge는 blind(어느 쪽이 스킬인지 모름) + 순서 무작위로 position bias(앞에 온 쪽을 편드는 편향) 제거.
- prompt에 스킬 규칙을 넣지 말 것(양쪽 다 이겨서 측정 무의미). trial은 여러 번(1회는 noise).
- CLI mode는 bash+python3 + (claude/codex/gemini/agy 중 하나 또는 OPENAI_API_KEY) 필요. agent-native mode는 subagent만 있으면 됨.

## 원문 — SKILL.md

````markdown
---
name: skill-ab-eval
description: >-
  Empirically measure two things for any task or domain: (1) does loading a
  SKILL.md actually change behavior — with_skill vs without_skill (baseline) — and
  (2) which CLI agent harness does the task best — claude vs codex vs gemini vs agy
  vs an OpenAI-compatible API. Runs the same prompt across the matrix in fresh,
  isolated contexts (subagents or separate CLI processes), a judge grades every
  output, repeated over trials, and you get a skill-lift table plus a harness
  leaderboard. Use to validate a new skill before shipping, catch skills that do
  nothing (or hurt), compare CLIs on a task you give, or pick the best harness for
  a domain. Triggers: evaluate skill, test skill, does my skill work, skill A/B,
  measure skill lift, compare CLIs, which agent is best, claude vs codex vs gemini,
  harness eval, benchmark agents on a task.
license: MIT
compatibility: >-
  Agent-native mode needs fresh-context subagents (Claude Code Task/Agent tool).
  CLI mode needs bash + python3 and at least one of: claude, codex, gemini, agy,
  or OPENAI_API_KEY. Eval format is agentskills.io-compatible.
metadata:
  owner: cskwork
  domain: evaluation
  inspired_by: https://github.com/darkrishabh/agent-skills-eval
  harness_calls: https://github.com/cskwork/cc-agent-call
  spec: https://agentskills.io/specification
---

# skill-ab-eval — prove what actually works

Two questions, one harness, real evidence:

1. **Skill axis** — does this `SKILL.md` change the agent's behavior, or is it dead
   weight in the context window? (`with_skill` vs `without_skill`)
2. **Harness axis** — for *this* task or domain, which CLI agent is best?
   (`claude` vs `codex` vs `gemini` vs `agy` vs `openai`)

Run them separately or crossed. It works on **any task you give** — a skill's
evals, or an ad-hoc prompt you type — across any domain.

It's the agent-native cousin of
[agent-skills-eval](https://github.com/darkrishabh/agent-skills-eval) (same
`evals.json` and with/without model) wired to the multi-CLI delegation pattern of
[cc-agent-call](https://github.com/cskwork/cc-agent-call): where cc-agent-call
*routes* work to the best CLI, this *measures* which CLI is best.

## Mental model

```
              one task prompt (a skill's eval, or one you type)
                                 │
        ┌────────────────────────┴────────────────────────┐
        │  matrix: harness × {with_skill, without_skill}   │
        ▼                                                  ▼
   claude with / without        codex with / without   ...gemini, agy, openai
        │  each cell = a FRESH context (subagent or separate CLI process)
        └────────────────────────┬────────────────────────┘
                                 ▼
                          judge (any harness)
                 grades each answer vs the assertions
                                 │  × N trials
                                 ▼
            skill-lift per harness  +  harness leaderboard
```

**Fresh, isolated context per cell is what makes it valid.** Each cell starts
clean, so the only variables are the harness and whether the skill is loaded.
Reusing a context leaks the skill into the baseline and silently breaks the result.

## When to use

- Before shipping a skill: prove it earns its place — and on which harness.
- Auditing a skill library: find skills with zero (or negative) lift.
- Choosing a CLI for a domain: "who's best at SQL? at commit messages? at React?"
- Comparing two skill versions or two CLIs head-to-head on tasks you provide.

## Two ways to run it

### A) CLI mode (any agent, CI, headless) — `scripts/run_eval.py` / `bin/skill-ab-eval`

The orchestrator drives real CLI harnesses through shell adapters in `runners/`
(claude/codex/gemini/agy) plus a built-in OpenAI HTTP backend. It builds the
matrix, judges, repeats trials, and writes artifacts.

```bash
# what can I run right now?
skill-ab-eval runners

# ad-hoc task, compare CLIs (no skill) — any domain you type
skill-ab-eval task "Explain async/await to a junior in 5 bullets." \
  --runners claude,codex,gemini --judge claude --trials 2

# ad-hoc task WITH a skill — skill lift × harness in one shot
skill-ab-eval task "Write a git commit message for the staged diff." \
  --skill examples/conventional-commit \
  --assert "Subject line is 50 characters or fewer." \
  --assert "Ends with a 'Refs:' footer." \
  --runners claude,codex --judge claude

# a whole evals suite across harnesses
skill-ab-eval run examples/conventional-commit --runners claude,gemini --judge claude
```

Output → `skill-ab-eval-workspace/<name>/iteration-1/`: per-cell `answer.md` +
`judge.json`, a `results.json`, and a `report.md` with the lift table + leaderboard.
See `reference/harnesses.md` and `runners/README.md`.

### B) Agent-native mode (inside a coding agent with subagents)

When you're inside an agent that can spawn subagents (Claude Code Task/Agent tool),
run the experiment with fresh subagents instead of separate CLI processes — no API
keys needed. This is the most rigorous form of the **skill axis** (2-way, blind
judge). Follow the protocol below.

## Eval format (agentskills.io-compatible)

`evals/evals.json` next to the skill. See `reference/eval-schema.md`.

```json
{
  "skill_name": "conventional-commit",
  "evals": [{
    "id": "feat-rate-limit",
    "prompt": "Write a git commit message for this diff:\n{{rate-limit.diff}}",
    "files": ["evals/files/rate-limit.diff"],
    "expected_output": "A conventional-commit subject under 50 chars, blank line, body, 'Refs:' footer.",
    "assertions": [
      "The subject line is 50 characters or fewer.",
      "The message ends with a 'Refs:' footer."
    ]
  }]
}
```

- `prompt` — neutral. Don't restate the skill's rules, or both sides "win" and you
  measure nothing.
- `assertions` — atomic, binary claims. They are the score. No assertions → the
  judge scores quality holistically (0–10).

## Agent-native protocol (skill axis, fresh subagents)

> Spawn fresh subagents — **never run a cell in your own context** or it's
> contaminated. Exact prompts in "Subagent prompt templates" below.

1. **Load.** Read the target `SKILL.md` body (strip frontmatter) and
   `evals/evals.json`. Inline `files` into each prompt. Pick `trials` (default 3).
2. **Run both sides, fresh, in parallel.** Per eval, per trial, spawn two subagents
   in one turn: Runner A (instructions = skill body) and Runner B (no skill). Same
   task prompt. Capture raw outputs. Runners never see the assertions.
3. **Judge, fresh + blind.** Spawn one judge subagent. Randomize order, label
   outputs neutrally ("Output 1/2"), give it `expected_output` + `assertions`. It
   returns pass/fail per assertion + a 0–10 score per output, as strict JSON. It
   never learns which had the skill. For close calls, judge again with the order
   swapped and average (kills position bias).
4. **Aggregate.** Per side, assertion pass rate across trials.
   `lift = with_skill_rate − without_skill_rate`.
5. **Verdict + artifacts.** Classify (table below), write the workspace + report.md.

To also cover the **harness axis** from agent-native mode, repeat the runs using
different CLIs via the `runners/` adapters (or cc-agent-call's delegation skills)
and compare — or just use CLI mode A, which does the full matrix for you.

## Verdict

| lift (pass-rate / score delta) | verdict |
|--------------------------------|---------|
| ≥ +0.20                        | **clear positive** — the skill helps |
| +0.05 … +0.20                  | marginal — directional, add trials |
| −0.05 … +0.05                  | **no measurable effect** — dead weight |
| ≤ −0.05                        | **negative** — the skill hurts; fix or drop |

Be honest about N: a few trials is *directional*, not significant. Report raw
numbers, not just the label. "No effect" and per-harness differences are real,
useful findings.

## Subagent prompt templates

### Runner A — with_skill
```
You are completing a task. Follow these instructions exactly:
--- BEGIN INSTRUCTIONS ---
{{SKILL_BODY}}
--- END INSTRUCTIONS ---
Task:
{{EVAL_PROMPT}}
Respond with only your answer. Do not explain your process.
```

### Runner B — without_skill (baseline)
```
Task:
{{EVAL_PROMPT}}
Respond with only your answer. Do not explain your process.
```

### Judge (blind, 2-way) / or independent (per output, N-way)
```
You are a strict, impartial grader. Grade only on the evidence in the answer(s).

Task that was given:
{{EVAL_PROMPT}}
What a good answer looks like:
{{EXPECTED_OUTPUT}}
Assertions (pass or fail each, in order):
{{ASSERTIONS_NUMBERED}}

--- OUTPUT 1 ---
{{FIRST_OUTPUT}}
--- OUTPUT 2 ---            (omit for independent N-way grading; grade one at a time)
{{SECOND_OUTPUT}}

Return STRICT JSON, no prose:
{ "output_1": {"assertions":[bool...], "score":0-10},
  "output_2": {"assertions":[bool...], "score":0-10},
  "notes": "one sentence on the key difference" }
```

> Keep a private map of which neutral label was with_skill. The judge never sees it.

## Mapping to your agent

- **Claude Code** — agent-native: Task/Agent tool, fresh `general-purpose` subagent;
  launch Runner A + B as two tool calls in one message (parallel), then the judge.
  CLI: `bin/skill-ab-eval` with `--runners claude,...`.
- **Codex / Gemini / Antigravity** — CLI mode; each is a runner adapter. Or use
  cc-agent-call's delegation skills to reach them from inside Claude Code.
- **Headless / CI** — `scripts/run_eval.py` with installed CLIs, or `--runners
  openai` + `OPENAI_API_KEY`. Deterministic, no interactive session.

## Anti-bias rules (do not skip)

1. Fresh, isolated context per cell. Never reuse across roles/trials/harnesses.
2. Blind 2-way judge (randomize order) or independent per-output grading for N-way.
3. Neutral prompts — never encode the skill's own rules in the task.
4. Multiple trials. One sample is noise.
5. Low temperature for runners, 0 for the judge, when controllable.
6. Report raw numbers and the judge used (note home-field bias if a harness judges).

## Workspace layout

```
skill-ab-eval-workspace/
└── <name>/iteration-1/
    ├── results.json          # cells, skill-lift, leaderboard, metric, judge
    ├── report.md             # skill-lift table + harness leaderboard
    └── <eval-id>/<runner>/<side>/trial-N/{answer.md,judge.json}
```

## Generating evals (when a skill has none)

Read the SKILL.md, infer 3–6 concrete, neutral tasks it claims to improve, write
2–5 binary `assertions` each from the skill's promises, save `evals/evals.json`,
then run. Keep prompts neutral so the test stays fair.
````
