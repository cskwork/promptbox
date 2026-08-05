---
title: wizard
summary: "사람만 할 수 있는 수작업 절차(대시보드 클릭, API 키 발급, CI 시크릿 등록)를 한 단계씩 안내하는 대화형 bash 스크립트를 만들어 준다. URL을 열어 주고, 무엇을 복사할지 알려 주고, 입력받은 값을 .env나 GitHub 시크릿에 대신 써 준다."
summary_en: "Generates an interactive bash wizard that walks a human through the manual steps an agent can't do — opening dashboards, capturing keys, writing them to .env and CI secrets."
tags: [skill, wizard, bash, onboarding, setup, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/wizard
author: mattpocock
license: mattpocock/skills 참조
order: 34
trigger: "인프라 프로비저닝 / 크리덴셜·CI 시크릿 설정 / 낯선 서드파티 대시보드 안내 / 일회성 마이그레이션·컷오버 / setup 스크립트 만들어 줘"
install: "npx skills add https://github.com/mattpocock/skills --skill wizard"
---

## 한 줄

**에이전트가 대신 못 하는 절차를 사람이 헤매지 않게 안내하는 bash 스크립트를 대신 써 준다.**
*EN: When only a human can do the steps, the agent writes the script that walks them through it.*

## 언제 쓰는가

- Stripe·Supabase·Vercel 같은 서드파티 dashboard(관리 화면)에서 키를 발급받아 `.env`에 넣어야 할 때
- 새 팀원이 로컬 환경을 세팅하는데 README가 12단계짜리 산문일 때
- CI가 요구하는 `secrets.*` / `vars.*` 값을 GitHub에 하나씩 등록해야 할 때
- 되돌릴 수 없는 one-off migration(일회성 이전 작업)·cutover(전환)를 순서대로 밟아야 할 때

에이전트가 스스로 할 수 있는 일에는 쓰지 않는다. 그건 그냥 시키면 된다.

## 무엇을 하는가

1. **절차 범위 확정** — `.env*`, README, `docker-compose*`, `.github/workflows/*`를 먼저 읽고 (묻지 않고) 필요한 단계와 각 단계가 만들어 내는 값을 뽑아 사용자에게 확인받는다.
2. **각 단계의 경로 매핑** — "Dashboard → Developers → API keys → Reveal test key → 복사"처럼 낯선 사람도 따라올 수 있는 구체적 지시를 적는다. 현재 UI를 모르면 **지어내지 않고 물어본다**.
3. **스크립트 작성** — `template.sh`를 복사해 `STAGES` 마커 아래에 stage만 채운다. 진행률·남은 시간 표시, secret 숨김 입력, `.env` idempotent(여러 번 실행해도 같은 결과) 갱신, `gh secret` 쓰기 같은 UX는 이미 라이브러리가 해결해 뒀다.
4. **검증·인계** — `bash -n`, 가능하면 `shellcheck`, `chmod +x`. 끝까지 직접 실행하지는 않는다 (브라우저를 열고 사람 입력에서 멈추므로). 대신 정적으로 추적한다.

## 함정

- **`STAGES` 마커 위의 라이브러리는 절대 손대지 말 것.** 모든 wizard에서 동일해야 한다는 게 이 스킬의 요점이다.
- **`template.sh`가 실제 payload다.** 아래 코드 블록은 `SKILL.md`뿐이고, 스크립트 뼈대인 `template.sh`는 위 `install` 명령으로 함께 받아야 동작한다.
- **wizard는 기본적으로 ephemeral(일회용)** — scratch나 `scripts/`에 두고 끝나면 지운다. 반복 가능한 setup 경로일 때만 커밋한다.
- **stage 하나에 한 가지 일만.** stage마다 화면을 지우므로, 사람이 봐야 할 내용이 스크롤 밖으로 밀려나면 안 된다.
- 되돌릴 수 없는 동작 앞에는 반드시 `confirm`, secret 입력은 반드시 `ask_secret`.

```markdown
---
name: wizard
description: Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover. Don't invoke this for steps the agent can perform itself.
---

# Wizard

A **wizard** is a bash script that walks a human, step by step, through a manual procedure that's tedious to do by hand and tedious to re-explain to an AI every time. It opens each URL, says exactly what to click and copy, captures the values, writes them where they belong (`.env`, GitHub secrets), confirms at every stage, and shows how much is left. It might configure third-party services, run a one-off migration, or move the project from one state to another.

The delightful UX is already solved by [template.sh](template.sh) — progress with time-remaining, confirmation gates, cross-platform URL opening (including WSL), hidden secret entry, idempotent `.env` upserts, `gh secret`/`gh variable` writes, and a closing summary. **Your job is only to scope the procedure and author its stages.** The library above the `STAGES` marker is identical in every wizard; that consistency is the point — never hand-edit it.

A wizard is ephemeral by default — built for one run, saved to a scratch or `scripts/` path, deleted when the job's done. Commit it only when the user wants a repeatable setup path that should live in the repo.

## Process

### 1. Scope the procedure

Work out every manual step the human must take and every value that gets captured along the way. Read the repo first — don't ask cold:

- For setup: `.env`, `.env.example`, `.env.*`, `README`, `docker-compose*`, framework config, and `.github/workflows/*` (every `secrets.*` / `vars.*` reference is a value the wizard must produce).
- For a migration or transition: the current state, the target state, and the irreversible actions between them.

Then show the user the ordered list of stages and the values each produces, and confirm — they may add, drop, or reorder.

**Done when:** every stage is named in order, and for each captured value you know (a) where the human gets it, (b) where it's written (`.env`, a GitHub secret, both, or nowhere — some stages are pure actions), and (c) whether it's secret (hidden entry) or public.

### 2. Map each stage's journey

For each stage, write the precise path a human follows: which URL to open, what to do there, where a value is shown, which variable it fills — e.g. "Dashboard → Developers → API keys → Reveal test key → copy". Where you don't actually know the current UI or the exact command, say so and ask the user or check the docs — never invent steps that may not exist.

**Done when:** every stage traces to concrete instructions a stranger could follow.

### 3. Author the wizard

Copy `template.sh` to the target path. Replace the example stage with one `stage` per step, in dependency order. Use the library helpers — `stage`, `say`/`step`, `open_url`, `ask`/`ask_secret`, `write_env`, `set_secret`/`set_var`, `pause`/`confirm` — and set `TOTAL_STAGES` and `TOTAL_MINUTES` to honest estimates (this drives the time-remaining display).

Hold the bar the template sets: open the URL before asking for its value, use `ask_secret` for anything secret, `write_env` every persisted value, `set_secret` only the values CI actually needs, and `confirm` before any irreversible action. Each `stage` clears the screen so only the current step is visible — keep a stage to one focused task so nothing the human needs scrolls away. Don't touch the library above the marker.

### 4. Verify and hand off

- `bash -n <script>`; run `shellcheck` if available.
- `chmod +x <script>`.
- Don't run it end-to-end yourself — it opens browsers and blocks on human input. Trace it statically instead: every value from step 1 is captured and lands where step 1 said, and every `set_secret` name exactly matches a `secrets.*` reference in CI.
- Tell the user how to run it. If it's a repeatable setup path, commit it and link it from the README so the next person runs the script instead of asking an AI.
```
