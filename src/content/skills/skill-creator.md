---
title: skill-creator
summary: "새 스킬(AI 에이전트에게 추가하는 기능)을 만들고 다듬어 주는 도구 — 어떤 기능인지 정리하고 초안을 잡은 뒤, 적용 전후를 나란히 돌려 비교하고 고치는 과정을 끝까지 안내한다."
summary_en: "Step-by-step workflow for creating a new Claude Code skill, testing it, and iterating until it works reliably."
tags: [skill, meta, anthropic, eval, subagent, iteration, benchmark]
source: https://github.com/anthropics/skills/tree/main/skills/skill-creator
author: anthropics
license: Anthropic skills 참조
order: 12
trigger: "스킬 만들기 / SKILL.md 작성 / 기존 skill 개선 / skill eval 실행 / description 최적화"
install: "npx skills add https://github.com/anthropics/skills --skill skill-creator"
---

## 한 줄

스킬 만들기는 6단계 — 무엇을 할 스킬인지 정리(intent) → 초안(draft) → 테스트 → 평가(eval, 병렬로 여러 에이전트 동시 실행) → 고치기 → 트리거 문구 다듬기. 스킬을 켠 쪽(with-skill)과 끈 쪽(baseline)을 **같은 턴**에 동시에 띄워(spawn) 한 번에 비교하는 게 핵심 (하나씩 돌리면 시간만 날아간다).

*EN: Six steps — pin down what the skill does, draft it, test, evaluate, fix, and tune the trigger wording.*

## 핵심 원칙

- **Progressive disclosure(필요한 만큼만 단계적으로 펼쳐 보여주기) 3단계**: metadata(요약 정보) (~100 words 항상 in context(맥락에 올라가 있음)) → SKILL.md body (<500 lines, trigger 시 로드) → bundled resources(함께 딸려오는 보조 파일) (필요 시)
- description은 **pushy(적극적으로 밀어붙이듯)**하게 — Claude는 스킬을 "undertrigger(켜져야 할 상황에서도 잘 안 켜짐)"하는 경향이 있어서, 트리거 phrase(문구)를 명시적으로 나열해야 한다
- 의도가 객관적으로 검증 가능한 작업 (file transform(파일 변환), code gen(코드 생성), fixed workflow(정해진 절차))만 test case(테스트 사례) 만들고, 주관적 (글쓰기, 디자인)은 정성 평가로

## Anatomy

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/    - Executable code for deterministic tasks
    ├── references/ - Docs loaded into context as needed
    └── assets/     - Files used in output
```

## Eval workflow (요약)

1. 모든 test case에 대해 with-skill + baseline subagent **동시** spawn
2. 결과 디렉토리: `<skill-name>-workspace/iteration-N/eval-<descriptive-name>/{with_skill,without_skill}/outputs/`
3. 실행 중에 assertion(검증 조건) 작성 (이름은 viewer에서 의미 명확하게)
4. `grading.json` 필드명은 정확히 `text`, `passed`, `evidence` (viewer가 의존)
5. `python -m scripts.aggregate_benchmark` → `benchmark.json` + `benchmark.md`
6. `eval-viewer/generate_review.py`로 viewer 띄우기 (cowork/headless면 `--static`)

## 함정

- `/skill-test` 같은 다른 테스트 스킬 쓰지 말 것 — 이 워크플로우 안에서 한 번에 끝낸다
- 새 iteration(반복 개선 회차)이면 eval_metadata.json을 **새로 만들기** — 이전 iteration에서 carry over 안 됨
- 변하지 않는 assertion (non-discriminating(with-skill/baseline 결과를 구분 못 하는))이나 high-variance eval은 분석 단계에서 따로 표시

## 원문 SKILL.md (frontmatter + 개요)

전체 487줄짜리 SKILL.md는 [원본 저장소](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)에서 확인. 아래는 frontmatter와 핵심 워크플로우:

````markdown
---
name: skill-creator
description: Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.
---

# Skill Creator

A skill for creating new skills and iteratively improving them.

At a high level, the process of creating a skill goes like this:

- Decide what you want the skill to do and roughly how it should do it
- Write a draft of the skill
- Create a few test prompts and run claude-with-access-to-the-skill on them
- Help the user evaluate the results both qualitatively and quantitatively
- Rewrite the skill based on feedback
- Repeat until you're satisfied
- Expand the test set and try again at larger scale

## Creating a skill

### Capture Intent
1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases/contexts)
3. What's the expected output format?
4. Should we set up test cases?

### Write the SKILL.md

- **name**: Skill identifier
- **description**: When to trigger, what it does. Primary triggering mechanism.
  Note: Claude tends to "undertrigger" skills. Make descriptions a little "pushy" —
  list trigger phrases explicitly.

### Progressive Disclosure (3-level loading)

1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - In context whenever skill triggers (<500 lines ideal)
3. **Bundled resources** - As needed (unlimited)

## Running evals (one continuous sequence)

### Step 1: Spawn all runs (with-skill AND baseline) in the same turn

For each test case, spawn two subagents in the same turn — one with the skill, one without.

### Step 2: Draft assertions while runs are in progress

### Step 3: Capture timing data as runs complete (only opportunity)

### Step 4: Grade, aggregate, launch the viewer

```bash
python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>

nohup python <skill-creator-path>/eval-viewer/generate_review.py \
  <workspace>/iteration-N \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-N/benchmark.json \
  > /dev/null 2>&1 &
```

For headless / cowork environments: `--static <output_path>` writes standalone HTML.
````
