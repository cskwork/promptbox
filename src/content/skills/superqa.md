---
title: superqa (cskwork/superqa-skill)
summary: "실제 브라우저로 웹사이트를 QA하는 스킬 — 프롬프트를 사용자 스토리 YAML DAG 시나리오로 바꿔 검토하고 실행하며, 콘솔·JS 오류·실패한 요청·예상 못한 팝업 같은 부작용을 사람이 읽는 리포트로 정리한다. 실행 디렉토리와 리포트 없이는 통과라고 말하지 않는다."
summary_en: "Real-browser QA with user-story YAML DAGs: review the journey before replay, run it with local browser bindings, and report browser-side failures with evidence."
tags: [skill, qa, browser, playwright, dag, regression, ci, junit, cskwork]
source: https://github.com/cskwork/superqa-skill
author: cskwork
license: MIT
order: 30
trigger: "/superqa · QA this <url> · browser test · regression check · review scenario DAG · record a scenario · smoke check · verify this URL"
install: "git clone https://github.com/cskwork/superqa-skill ~/.claude/skills/superqa && pip3 install textual playwright pyyaml && python3 -m playwright install chromium"
---

## 한 줄

웹사이트를 실제 브라우저로 QA(품질 확인)하는 Claude 스킬. 평범한 프롬프트 한 줄을 사용자 스토리 YAML DAG(사용자 여정과 의존 관계를 화살표로 잇는 그래프)로 바꾸고, 진짜 브라우저를 몰아 실행한 뒤, 콘솔/JS 오류·실패한 네트워크 요청·예상 못한 대화상자·팝업·새 탭 같은 부작용(side effect: 원래 의도하지 않은 결과)을 사람이 읽을 수 있는 리포트로 정리한다. YAML 노드에는 스토리와 인수 기준만 두고, 셀렉터·입력값 같은 재생 상세는 로컬 runtime binding(실행용 연결 정보)으로 분리한다.

*EN: A plain prompt in, a reviewable user-story graph and real-browser evidence out.*

## 언제 쓰는가

- "이 사이트 QA 해줘 <url>" — EXPLORE-QA 모드(라이브 사이트를 훑어 사용자 스토리 시나리오를 만들고 실행)
- 기능이 끝나 회귀(regression: 예전엔 되던 게 깨졌는지) 확인 — REGRESSION 모드
- 기존 YAML 시나리오의 사용자 여정·분기·합류를 먼저 검토 — `superqa dag check` + Admin
- "떠 있나 빠르게만 보자" — AUTO(스모크) 모드
- 비개발자가 클릭으로 시나리오를 녹화(record) — RECORD 모드 / TUI
- CI에 붙여 JUnit 리포트로 자동 검증 — SCHEDULE / `--headless`

## 무엇을 하는가

요청 신호로 모드를 라우팅한다: EXPLORE-QA / REGRESSION / AUTO / RECORD / SCHEDULE. 새 시나리오는 `~/.superqa/scenarios/<site>/`에 `dag.nodes` YAML로 저장하며, 각 노드는 `id`·`story`·`acceptance`·`depends_on`만 담는다. `superqa dag check --all --site <site>`가 구조를 검사하고 `superqa serve`의 Admin이 사용자 스토리와 인수 기준의 분기·합류를 그려 준다. 그래프에는 셀렉터·입력값·비밀을 보내지 않는다. 실제 브라우저 재생 단계는 `~/.superqa/runtimes/`의 로컬 바인딩에만 두며, 매 실행은 `~/.superqa/reports/<stamp>-<name>/report.html`와 단계별 스크린샷을 남긴다.

## 함정

- **실행 증거 없이 통과 선언 금지** — run 디렉토리 + 리포트가 있어야 "통과". 계약(contract)의 핵심.
- 기존 `steps:` YAML은 읽고 실행해도 자동으로 DAG로 바뀌지 않는다. 소유자가 원할 때만 `superqa dag migrate`를 실행한다.
- 사용자 스토리 DAG는 바인딩이 없어도 검토할 수 있지만 재생은 하지 않는다. 녹화기/QA 에이전트가 로컬 바인딩을 만든 뒤 실행한다.
- 사이트별 지식·데이터는 로컬(`reference/site-rules.md`)에만 두고 **커밋하지 않는다**.
- deliver 성격의 자동화는 아니며, 판정(judge)이 채점하는 증거 기반 QA 하네스다.

```markdown
---
name: superqa
description: Browser QA for any website with reviewable YAML DAG scenarios. Use when the user says QA or browser test; gives a URL to verify; names a known domain or feature to re-QA; wants a regression sweep after a feature lands; asks for a quick smoke check; wants to record a test by clicking, schedule one, or open the QA dashboard; or needs QA against a local stack because the shared environment is down or the cases are destructive.
---

# SuperQA - browser QA on anything, for anyone

Contract: simple prompt -> concrete scenarios -> real browser evidence -> report in the
user's language. Never claim a check passed without a run directory + report to show.

## Mode (classify the request, state it in one line)

| Signal in request | Mode | Route |
|---|---|---|
| known domain / "QA <domain> <feature>" / repeat QA on something QA'd before | DOMAIN-QA | load the domain pack, QA per feature area, reuse archived scripts (`reference/domain-packs.md`) |
| "QA this <url>", vague target, no scenarios yet | EXPLORE-QA | explore live site, generate scenario cases, run them (`reference/agent-qa.md`) |
| scenarios exist / "run the cases" / feature finished, verify | REGRESSION | `superqa run --all --site <site>`; diff vs last run (`reference/agent-qa.md` step 5) |
| "quick check / smoke / is it up" | AUTO | `superqa auto <url> --site <site>` |
| non-dev wants to create a test by clicking | RECORD | `superqa record <url>` or TUI `n` key (`reference/tui.md`) |
| "every N minutes / daily / automate" | SCHEDULE | `superqa schedule add <scenario> --every <min>` + daemon (`reference/tui.md`) |
| "open the QA app / dashboard" | TUI | `bash scripts/superqa.sh` |
| "test locally / without the dev server / offline", shared env down, destructive cases | LOCAL-OFFLINE | bring the stack up locally, run the same scenarios with `--var base_url=...` (`reference/local-offline.md`) |

## Hard rules

1. **Site knowledge is local, never committed.** Entry URLs, accounts, login quirks,
   popup behaviors live in `~/.superqa/sites/<site>/rules.md` and the SQLite var store -
   never in this repo, never in scenario files pushed anywhere (`reference/site-rules.md`).
2. **Credentials via the var store only.** `superqa vars set <site> username <v>` /
   `password <v>`; scenarios reference `{{username}}` / `{{password}}`. Password-like keys
   are auto-masked in every report. Never hardcode credentials in YAML or reports.
3. **Evidence or it did not happen.** Every run produces
   `~/.superqa/reports/<stamp>-<name>/report.html` + per-step screenshots. Quote the
   report path and the pass/fail counts in your summary.
4. **Report in the user's language.** Scenario `language:` drives report labels; your
   summary to the user follows the conversation language (`reference/report.md`).
5. **Side effects are findings, not noise.** Console errors, JS exceptions, failed
   requests, HTTP 4xx/5xx, unexpected dialogs/popups/tabs are collected on every run,
   deduped with counts, and diffed against the previous run (new types = regression
   signal). Declare known noise in `~/.superqa/sites/<site>/ignore.yaml` instead of
   ignoring findings by hand (`reference/side-effects.md`).
6. **Popups and dialogs never block a run.** Engine policy auto-accepts dialogs and
   follows new tabs by default; scenario `policy:` overrides (`reference/scenario-format.md`).
7. **A local copy of shared data is read-only at the source, subsetted, redacted, and
   never committed.** Local config gets dummy secrets only - never a real shared-environment
   credential to make something boot (`reference/local-offline.md`).
8. **Reusable QA scripts get archived, not abandoned.** Helper scripts (data discovery,
   fixture pickers, probes, harnesses) that proved useful go into the domain pack under
   `<packs_home>/<domain>/<feature>/scripts/` with a provenance header. Check the pack
   BEFORE writing a new script. Pack location is asked once and stored in
   `~/.superqa/config.yaml` (`reference/domain-packs.md`).
9. **Exploration engine follows the cascade.** ego-browser (ego-lite) first on macOS,
   then Playwright MCP, then `playwright-cli`, then any other installed driver.
   Deterministic replay is always the superqa engine (`reference/engines.md`).
10. **Scenario DAG is the review contract.** New or recorded cases use `dag.nodes`,
    each with a stable `id`, a user-story `story`, user-visible `acceptance`, and explicit
    `depends_on`. Never put selectors, values, or browser actions in this YAML; the local
    runtime binding holds replay mechanics. Run `superqa dag check --all --site <site>`
    and inspect the local Admin graph before execution. Legacy `steps:` files remain
    readable without being rewritten; only `superqa dag migrate` changes them
    (`reference/scenario-format.md`).

## EXPLORE-QA loop (default when only a URL/prompt is given)

1. **Ground.** Read `~/.superqa/sites/<site>/rules.md` if present; ask for credentials
   only if login is required and vars are missing.
2. **Explore.** Drive the live site with the selected engine (snapshot -> click ->
   snapshot; `reference/engines.md`), mapping entry flow, login, menus,
   popups/new tabs (`reference/agent-qa.md`).
3. **Generate cases.** Write user-story `dag.nodes` YAMLs to
   `~/.superqa/scenarios/<site>/` covering happy path, validation, error paths, edge
   cases, and meaningful popup/tab transitions. Review story/acceptance/dependencies
   with `superqa dag check --all --site <site>` and the Admin graph, then create the
   separate local runtime binding (`reference/scenario-gen.md`).
4. **Run.** `python3 -m superqa_tui run --all --site <site> --headless` (from this skill's
   root, or the installed `superqa` command).
5. **Report.** Read the report, triage side effects, summarize for the user in their
   language with the report path. Update the local site rules file with what you learned.

## Non-dev lane (what you tell users)

- **Web admin (most clickable): `superqa serve`** opens a browser dashboard listing every
  scenario - recorded and agent-authored alike - with its user-story dependency DAG, a
  Run button, live progress, run history, and inline reports. It exposes only node IDs,
  stories, acceptance criteria, and dependency links; local selectors and values stay
  out of the graph. Same data as the TUI/CLI.
- Terminal TUI: `bash scripts/superqa.sh` - `n` record by clicking in a real browser,
  `r` run, `a` run all, `u` auto QA, `s` schedule, `v` accounts/vars, `o` open report.
- While recording, a SuperQA panel floats in the browser (pause / add-assertion /
  save-and-finish; it re-mounts itself if the site re-renders). Typed passwords are
  stored as `{{password}}`, never as plain text.

## Reference map

| File | When |
|---|---|
| `reference/domain-packs.md` | DOMAIN-QA: per-domain/feature packs, script archiving, pack location config |
| `reference/engines.md` | exploration engine cascade (ego-browser -> Playwright MCP -> playwright-cli -> other) |
| `reference/agent-qa.md` | EXPLORE-QA / REGRESSION procedure for the agent |
| `reference/scenario-gen.md` | prompt -> reviewable DAG scenario case design method |
| `reference/scenario-format.md` | user-story YAML DAG schema, local runtime binding, `{{vars}}`, policy |
| `reference/side-effects.md` | what is captured; triage rules |
| `reference/site-rules.md` | local per-site knowledge protocol (never commit) |
| `reference/report.md` | report structure + language rules |
| `reference/tui.md` | TUI / record / schedule usage for humans |
| `reference/local-offline.md` | LOCAL-OFFLINE: local stack + data subset, DB-derived fixtures, differential proof |

**Done =** mode stated; scenarios exist as checked YAML DAGs under `~/.superqa/scenarios/<site>/`;
Admin graph reviewed; run executed with report path quoted; side effects triaged; site rules updated;
domain pack updated (feature map + any new reusable script archived);
no site-specific data staged for commit.
```
