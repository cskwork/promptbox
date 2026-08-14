---
title: aside-browser
summary: "코딩 에이전트가 Aside 브라우저에 웹 작업을 넘기는 스킬. Aside CLI를 MCP 서버(aside mcp)로 붙이거나 `aside \"...\"` 한 줄로 호출해, 내가 이미 로그인해 둔 사이트에서 작업을 시키고 결과만 받아온다. 공개 API가 없어 Playwright로는 못 하는 사내 툴·대시보드가 대상. macOS 전용이며, 앱 설치와 로그인은 사람이 먼저 끝내야 동작한다."
summary_en: "Hands browser work from your coding agent to Aside. Wire it in as an MCP server with `aside mcp`, or fire a one-liner with `aside \"...\"`, and it drives sites you are already signed into — the internal dashboards and admin pages Playwright can't reach because they have no API. macOS only, and inert until you install and sign into the app yourself."
tags: [browser, web-automation, mcp, agent-handoff, macos, aside]
source: https://docs.aside.com/help/developers
author: Aside Computer Inc.
trigger: "로그인 세션이 필요한 웹 작업을 에이전트가 대신해야 할 때 — 사내 대시보드 조회, 관리자 페이지 조작, 공개 API가 없는 SaaS에서 데이터 추출. Playwright로 로그인부터 새로 뚫어야 하는 상황이면 이 스킬을 먼저 고려한다."
install: "curl -fsSL https://releases.aside.com/install.sh | bash"
order: 40
---

## 한 줄

Playwright는 **빈 브라우저**를 띄우고 로그인부터 새로 뚫어야 한다. Aside CLI는 **내가 이미 로그인해 둔 브라우저**를 그대로 쓴다. 그래서 공개 API도 없고 로그인도 까다로운 사내 툴이 자동화 대상이 된다.

## 언제 쓰는가

| 상황 | 쓸 것 |
|---|---|
| 공개 API 없는 사내 대시보드·관리자 페이지 조회/조작 | **aside-browser** |
| 내 실계정 세션이 있어야만 보이는 데이터 추출 | **aside-browser** |
| CI에서 돌려야 하는 회귀 테스트, headless(화면 없이 실행), 결정적 재현 | Playwright |
| Linux·Windows | Playwright (Aside는 macOS 전용) |

## 무엇을 하는가

- `aside mcp`로 Aside를 **MCP 서버**(에이전트에 외부 도구를 물리는 표준 연결 규약)로 노출해, 코딩 CLI가 툴 호출로 브라우저 작업을 넘긴다.
- 일회성이면 `aside "..."` 한 줄. 이어서 하려면 `--session <id>`로 세션을 재개한다.
- 기기에 계정이 여러 개면 `aside account use`로 어느 로그인 상태를 쓸지 고른다.

## 함정

- **macOS 전용**이다. 다른 OS에서는 설치하지 말고 Playwright로 간다.
- **앱 설치와 로그인이 선행 조건**이다. CLI만 깔아두면 명령은 있지만 작업은 실패한다. 로그아웃된 계정을 지정하면 CLI가 경고와 복구 절차를 출력한다.
- **번들 모델은 활성 세션을 요구한다.** 내가 직접 넣은 OpenAI·Anthropic 키는 로그아웃 상태에서도 계속 동작하지만, Aside 제공 모델은 로그인이 끊기면 멈춘다.
- **REPL API는 문서화된 게 `openTab(url)` 하나뿐**이다. `page`·`locator`·스크린샷 메서드는 공개 문서에 정의돼 있지 않으니, 있다고 가정하고 코드를 짜지 말고 먼저 확인하라.
- **되돌릴 수 없는 동작은 사람 확인을 거치게 두라.** 이 스킬은 내 실계정 세션 위에서 돈다. 결제·발송·삭제를 에이전트 판단으로 밀지 않는다.
- **CI에 넣지 마라.** GUI 앱과 사람 로그인에 의존하므로 재현 가능한 파이프라인 단계가 될 수 없다.

## SKILL.md

Aside는 자체 `SKILL.md`를 배포하지 않는다. 아래는 위 공식 문서(`docs.aside.com/help/developers`)에 실제로 기재된 명령만으로 구성한 스킬 정의다.

````markdown
---
name: aside-browser
description: Hand a browser task to the Aside browser, which drives sites the user is already signed into. Use when the task needs a real logged-in session on a site with no usable public API — internal dashboards, admin pages, SaaS consoles — and Playwright would have to re-solve login. macOS only. Do NOT use for CI, headless runs, or deterministic regression tests; use Playwright for those.
---

# aside-browser

Aside is a macOS browser with a built-in agent. Its CLI exposes that agent to other tools,
so a coding agent can delegate web work instead of re-driving a blank browser.

## Preconditions — check before doing anything

1. macOS only.
   ```bash
   uname -s   # must print Darwin; otherwise STOP and tell the user to use Playwright
   ```
2. CLI present.
   ```bash
   command -v aside
   ```
   If missing, install it:
   ```bash
   curl -fsSL https://releases.aside.com/install.sh | bash
   ```
   (Aside's Developer settings can also install, update, or reinstall the CLI.)
3. An account is signed in.
   ```bash
   aside account list     # '*' marks the active account
   aside account status
   ```
   If the target account is signed out, the CLI prints a warning with recovery steps. Do not
   work around it. Report it and stop: re-authenticate in `Aside Settings > Account`, or switch
   to a signed-in account. User-supplied OpenAI or Anthropic keys keep working while signed out,
   but Aside's bundled models require an active session.

The app itself is a DMG the user installs and signs into. Never install the app, complete its
first-run onboarding, or answer its privacy prompts on the user's behalf.

## Route the task before using this skill

| Task | Tool |
|---|---|
| Needs the user's existing login on a site with no usable API | **Aside** |
| CI, headless, deterministic regression, cross-platform | **Playwright** |
| Not macOS | **Playwright** |

## Run a task

One shot — pass the instruction as a single quoted natural-language string:

```bash
aside "Open localhost:3000 and run a smoke test"
```

Resume an existing session instead of starting over:

```bash
aside --session <session-id> "Continue"
```

Scope one invocation to a specific account (works with `aside` and `aside exec`):

```bash
aside --account u1 "..."
```

Set the default account for later commands:

```bash
aside account use u1
```

## Expose Aside as an MCP server

Prefer this when the host agent will make several browser calls — it turns Aside into tool calls
instead of shell round-trips.

```bash
aside mcp
```

For clients that read `mcp.json`:

```json
{
  "mcpServers": {
    "aside": {
      "command": "aside",
      "args": ["mcp"]
    }
  }
}
```

If Aside's Developer settings report a concrete CLI path, use that absolute path as `command`.

## REPL — deterministic steps

```bash
aside repl "const p = await openTab('https://example.com')"
```

Documented for "direct page inspection, screenshots, downloads, or deterministic browser steps."

**`openTab(url)` is the only API element the official docs define.** Do not assume `page`,
`tabs`, `locator`, or screenshot methods exist. If you need one, probe for it in a throwaway
call and report what you find — never write a multi-step REPL script against a guessed API.

## Rules

- Never enter credentials yourself. Aside autofills them into the page; that is the point.
- Stop and ask before anything irreversible — payments, sends, posts, deletes.
- Report which account ran the task, so the user can audit it.
- Never present an Aside run as a reproducible test result. It depends on a GUI app and a human
  login, so it is evidence of a one-time outcome, not a regression gate.
````
