---
title: Ponytail (DietrichGebert/ponytail)
summary: "AI 코딩 에이전트를 '게으른 시니어 개발자' 모드로 만드는 플러그인. 코드를 쓰기 전 7단계 사다리(YAGNI → 재사용 → stdlib → 네이티브 기능 → 설치된 의존성 → 한 줄 → 최소 구현)를 올려 정말 필요한 코드만 쓰게 강제한다. 20개 에이전트 지원, 실측 기준 코드 -54% · 비용 -20% · 시간 -27%, 안전성 100% 유지."
summary_en: "A plugin that flips coding agents into 'lazy senior dev' mode — a 7-rung ladder forces the simplest code that actually works (YAGNI, stdlib first, one line over fifty). Works across 20 agents; measured -54% code, -20% cost, -27% time, still 100% safe."
tags: [plugin, lazy-code, yagni, minimal-code, code-review, multi-harness]
source: https://github.com/DietrichGebert/ponytail
author: Dietrich Gebert
license: MIT
order: 12
harnesses: [Claude Code, Codex CLI, GitHub Copilot CLI, Pi, OpenCode, Gemini CLI, Antigravity CLI, Hermes Agent, Qoder, Swival, Devin CLI, OpenClaw, Cursor, Windsurf, Cline, Kiro, Zed, Amp, Jules, CodeWhale]
install: "/plugin marketplace add DietrichGebert/ponytail → /plugin install ponytail@ponytail (Claude Code) — 다른 하네스는 본문 참조"
---

## 한 줄

"50줄 짜던 걸 한 줄로 바꿔주는 시니어"를 에이전트 안에 넣는 플러그인. 코드를 쓰기 전에 7단계 **사다리(ladder)** 를 한 칸씩 올라가, *이걸 꼭 만들어야 하나?* 에서 시작해 *이미 코드베이스에 있진 않나? · stdlib(표준 라이브러리)가 하진 않나? · 네이티브 플랫폼 기능으로 되진 않나? · 한 줄로 되진 않나?* 를 차례로 검사하고, 전부 아니어야 *작동하는 최소 코드* 를 쓴다.

핵심은 **"최소 토큰"이 아니라 "작업에 딱 필요한 만큼"**. 검증·에러 처리·보안·접근성(a11y)은 절대 잘리지 않고, 코드가 작아지는 건 *필요해서*지 골프(숫자만 줄이기)가 아니다. 비용·지연 감소는 모델이 사다리를 잘 따를 때 생기는 부산물이다.

*EN: A plugin that puts a "lazy senior dev" in your agent — a 7-rung ladder makes it stop at the first rung that holds (YAGNI, reuse, stdlib, native, installed dep, one-liner, then minimum). Cuts nothing that matters for safety.*

## 작동 방식 · 명령

사다리는 문제를 **이해한 뒤에** 오른다 — 변경이 닿는 코드를 읽고 흐름을 끝까지 추적한 *다음* 칸을 고른다. 게으름은 해법에만, 읽기에는 절대 게으르지 않다.

| 명령 | 역할 |
|------|------|
| `/ponytail [lite \| full \| ultra \| off]` | 강도 설정 / 끄기. 인자 없으면 현재 상태 |
| `/ponytail-review` | 현재 diff(변경분)에서 오버엔지니어링을 찾아 삭제 리스트 반환 |
| `/ponytail-audit` | diff 말고 레포 전체에서 오버엔지니어링 감사 |
| `/ponytail-debt` | 미뤄둔 `ponytail:` 단축키를 원장(ledger)에 모아 "나중"이 "안 함"이 되지 않게 |
| `/ponytail-gain` | 벤치마크 기준 실측 효과(코드↓ 비용↓ 속도↑) 표시 |
| `/ponytail-help` | 명령 빠른 참조 |

기본 모드는 `full`이며, 매 세션마다 **항상 켜져(active)** 있다. `PONYTAIL_DEFAULT_MODE` 환경변수나 `~/.config/ponytail/config.json`의 `defaultMode`로 세션 기본값을 바꾼다. 규칙은 Agent 도구가 띄운 subagent(보조 에이전트)에도 주입되며, `PONYTAIL_SUBAGENT_MATCHER` 정규식으로 특정 타입만 골라 켤 수 있다.

## 하네스별 설치

플러그인 티어(명령 + 훅 + 항상-켜짐)와 규칙-복사 티어(항상-켜짐 규칙만)가 있다.

### Claude Code

```bash
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

> 두 명령을 **각각 다른 프롬프트**로 보내야 설치된다.

### Codex CLI

```bash
codex plugin marketplace add DietrichGebert/ponytail
codex plugin add ponytail@ponytail
codex            # /hooks 에서 라이프사이클 훅 2개 검토·신뢰 후 새 스레드
```

### GitHub Copilot CLI

```bash
copilot plugin marketplace add DietrichGebert/ponytail
copilot plugin install ponytail@ponytail
```

명령은 네임스페이스가 붙는다: `/ponytail:ponytail ultra`, `/ponytail:ponytail-review`.

### Pi

```bash
pi install git:github.com/DietrichGebert/ponytail
```

### OpenCode

```json
{ "plugin": ["@dietrichgebert/ponytail"] }
```

체크아웃에서 실행 시: `{ "plugin": ["./.opencode/plugins/ponytail.mjs"] }`. 이 레포의 `AGENTS.md`도 자동 로드돼 플러그인 없이도 규칙은 유지되고, 플러그인이 `lite/full/ultra/off` 레벨을 추가한다.

### Gemini CLI · Antigravity CLI

```bash
gemini extensions install https://github.com/DietrichGebert/ponytail
agy plugin install https://github.com/DietrichGebert/ponytail   # Antigravity (Gemini 후속)
```

### Hermes · Devin · Qoder · Swival · OpenClaw

```bash
hermes plugins install DietrichGebert/ponytail --enable
devin plugins install DietrichGebert/ponytail
swival skills add --global https://github.com/DietrichGebert/ponytail && swival skills add ponytail
clawhub install ponytail
```

Qoder: 루트 `AGENTS.md`를 자동 로드해 체크아웃에서 바로 동작. 풀 플러그인 지원은 `hooks/qoder-hooks.json`을 `.qoder/settings.json`에 추가.

### 규칙-복사 티어 (Cursor · Windsurf · Cline · Kiro · Zed · Copilot Chat · Amp · Jules · JetBrains Junie)

레포에서 매칭되는 규칙 파일을 복사: `.cursor/rules/`, `.windsurf/rules/`, `.clinerules/`, `.github/copilot-instructions.md`, `AGENTS.md`, `.kiro/steering/ponytail.md`. 항상-켜짐 규칙만 들어오고 명령·훅은 빠진다.

## 함정

- **게으름 ≠ 대충.** 문제를 안 읽고 작은 diff만 내면 그건 "효율로 위장한 두 번째 버그"다. 사다리는 이해 *뒤에* 오른다.
- **Node 필요.** Claude Code/Codex 플러그인의 두 라이프사이클 훅이 Node.js를 쓴다. Nix/nvm 사용자는 비대화형 셸 PATH에 `node`가 있어야 한다 — 없어도 스킬은 동작, 항상-켜짐만 조용히 꺼진다.
- **최소인 코드 = 최선이 아닐 수 있음.** 같은 줄 수의 stdlib 두 방식이면 *엣지케이스가 맞는 쪽* 을 고른다. 게으름은 코드가 적은 거지 알고리즘이 허술한 게 아니다.
- **ultra 모드**는 코드베이스가 당신을 개인적으로 원망할 때 쓴다(README 원문 그대로).

## 원문: 규칙셋 (AGENTS.md)

플러그인 없이도, 아래 규칙을 프로젝트 `AGENTS.md`나 `~/.codex/AGENTS.md`에 붙여넣으면 항상-켜짐 lazy 모드가 된다. (원문 그대로)

````markdown
# Ponytail, lazy senior dev mode

You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.

Before writing any code, stop at the first rung that holds:

1. Does this need to be built at all? (YAGNI)
2. Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here, don't re-write it.
3. Does the standard library already do this? Use it.
4. Does a native platform feature cover it? Use it.
5. Does an already-installed dependency solve it? Use it.
6. Can this be one line? Make it one line.
7. Only then: write the minimum code that works.

The ladder runs after you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb.

Bug fix = root cause, not symptom: a report names a symptom. Grep every caller of the function you touch and fix the shared function once — one guard there is a smaller diff than one per caller, and patching only the path the ticket names leaves a sibling caller still broken.

Rules:

- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm.
- Mark deliberate simplifications that cut a real corner with a known ceiling (global lock, O(n²) scan, naive heuristic) with a `ponytail:` comment naming the ceiling and upgrade path.

Not lazy about: understanding the problem (read it fully and trace the real flow before picking a rung, a small diff you don't understand is just laziness dressed up as efficiency), input validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off), anything explicitly requested. Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind, the smallest thing that fails if the logic breaks (an assert-based demo/self-check or one small test file; no frameworks, no fixtures). Trivial one-liners need no test.
````
