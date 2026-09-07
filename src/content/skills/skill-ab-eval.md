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
description: 'skill-ab-eval — A/B test skill lift, compare CLI agents. Use when: "evaluate skill", "skill A/B", "compare CLIs".'

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

**Fresh context per cell is necessary but not sufficient.** Keep model/version, tools, fixture state, permissions, and global/project instructions equivalent. Check automatic skill discovery so the baseline does not load the candidate through another path.
Reusing a context leaks the skill into the baseline and silently breaks the result.

## When to use

- Before shipping a skill: prove it earns its place — and on which harness.
- Auditing a skill library: find skills with zero (or negative) lift.
- Choosing a CLI for a domain: "who's best at SQL? at commit messages? at React?"
- Comparing two skill versions or two CLIs head-to-head on tasks you provide.

## Two ways to run it

### A) CLI mode (any agent, CI, headless) — `scripts/run_eval.py` / `bin/skill-ab-eval`

The orchestrator runs `claude`/`codex`/`gemini`/`agy` straight off `PATH` (no shell,
so Windows works too), plus a built-in OpenAI HTTP backend when `OPENAI_API_KEY` is
set. Any other `--runners` name resolves to a `runners/<name>.sh` adapter and needs
bash. It builds the matrix, judges, repeats trials, and writes artifacts.

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

Output → `skill-ab-eval-workspace/<name>/iteration-N/` (N auto-increments, so reruns
never overwrite): per-cell `answer.md` + `judge.json`, a `results.json`, and a
`report.md` with the lift table + leaderboard.
Read `reference/harnesses.md` before choosing runners and a judge; read the repo-root
`runners/README.md` before writing a custom adapter.

### B) Agent-native mode (inside a coding agent with subagents)

When you're inside an agent that can spawn subagents (Claude Code Task/Agent tool),
run the experiment with fresh subagents instead of separate CLI processes — no API
keys needed. Use the **skill axis** with a 2-way blind judge when fresh subagent contexts can be isolated. Follow the protocol below.

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
   `evals/evals.json`. Inline `files` into each prompt. Pick `trials` (default 3). Record whether this is body-only or full-package testing; body-only injection cannot prove supporting scripts/references or discovery work. Bound allowed tools, files, side effects, and spending before starting any runner.
2. **Run both sides, fresh.** Per eval and trial, use isolated Runner A (skill) and Runner B (no skill). Run sequentially unless independent parallel execution improves cost or elapsed time without shared-state contamination. Same
   task prompt. Capture raw outputs. Runners never see the assertions.
3. **Judge, fresh + blind.** Spawn one judge subagent. Randomize order, label
   outputs neutrally ("Output 1/2"), give it `expected_output` + `assertions`. It
   returns pass/fail per assertion + a 0–10 score per output, as strict JSON. It
   never learns which had the skill. For close calls, judge again with the order
   swapped and average (kills position bias).
4. **Aggregate.** Per side, assertion pass rate across trials.
   `lift = with_skill_rate − without_skill_rate`.
5. **Verdict + artifacts.** Classify with the verdict table below, then write the
   workspace in the layout below — done when every (eval × side × trial) cell has its
   `answer.md` and `judge.json`, and `results.json` + `report.md` sit at the root.

To also cover the **harness axis** from agent-native mode, repeat the runs using
different CLIs via the `runners/` adapters (or cc-agent-call's delegation skills)
and compare — or just use CLI mode A, which does the full matrix for you.

## Verdict

| lift (pass-rate or normalized 0–1 score delta) | verdict |
|--------------------------------|---------|
| ≥ +0.20                        | **clear positive** — the skill helps |
| +0.05 … +0.20                  | marginal — directional, add trials |
| −0.05 … +0.05                  | **no measurable effect in this sample** |
| ≤ −0.05                        | **negative in this sample** — investigate regressions |

Be honest about N: a few trials is *directional*, not significant. The labels are descriptive heuristics, not confidence tests or automatic delete recommendations. Report raw
numbers, sample size, and uncertainty. "No effect" and per-harness differences are real,
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
  use separate contexts for A, B, then the judge; concurrency is optional.
  CLI: `bin/skill-ab-eval` with `--runners claude,...`.
- **Codex / Gemini / Antigravity** — CLI mode; each is a built-in runner. Or use
  cc-agent-call's delegation skills to reach them from inside Claude Code.
- **Headless / CI** — `scripts/run_eval.py` with installed CLIs, or `--runners
  openai` + `OPENAI_API_KEY`. Headless execution does not make model outputs deterministic.

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
└── <name>/iteration-N/        # N auto-increments; reruns never overwrite
    ├── results.json          # cells, skill-lift, leaderboard, metric, judge
    ├── report.md             # skill-lift table + harness leaderboard
    └── <eval-id>/<runner>/<side>/trial-N/{answer.md,judge.json}
```

## Generating evals (when a skill has none)

Read the SKILL.md, infer 3–6 concrete, neutral tasks it claims to improve, write
2–5 binary `assertions` each from the skill's promises, save `evals/evals.json`,
then run. Keep prompts neutral so the test stays fair.

Token reporting: distinguish cached input, uncached input, and output when available. Byte counts, raw tokens, or a small measured lift do not prove allowance savings or universal skill value.
````
