---
title: aside-browser
summary: "코딩 에이전트가 Aside 브라우저를 조종하는 공식 스킬. 통째로 맡길 땐 `aside exec`로 Aside 에이전트를 서브에이전트처럼 띄우고, 증거가 필요할 땐 `aside repl`로 Playwright 호환 JS 환경에 들어가 snapshot·스크린샷·다운로드를 직접 집는다. 내가 이미 로그인해 둔 Slack·X·LinkedIn 같은 계정과 브라우징 기록 위에서 동작한다. macOS 전용."
summary_en: "The official skill for driving Aside from your coding agent. Delegate a whole task with `aside exec`, which spawns Aside's own agent like a browser-shaped subagent — or drop into `aside repl`, a Playwright-compatible JS session, when you need the evidence itself: accessibility snapshots, annotated screenshots, downloads. It works across the accounts you're already signed into. macOS only."
tags: [browser, web-automation, playwright, qa, agent-handoff, macos, aside]
source: https://docs.aside.com/help/developers
author: Aside Computer Inc.
trigger: "브라우저 자동화가 필요할 때 — QA, 요소 조작, 스크린샷·스냅샷, 네트워크 캡처. 또는 사용자가 이미 로그인해 둔 계정·앱(Slack, X, LinkedIn 등)·메모리·브라우징 기록을 가로질러 작업해야 할 때."
install: "curl -fsSL https://releases.aside.com/install.sh | bash"
order: 40
---

## 한 줄

Playwright는 **빈 브라우저**를 띄워 로그인부터 새로 뚫어야 한다. Aside는 **내가 이미 로그인해 둔 브라우저**를 그대로 쓰면서, REPL에서는 Playwright와 거의 같은 API를 준다. 로그인 상태가 필요한 작업과 결정적(deterministic, 매번 같은 결과) 조작을 한 도구에서 처리한다.

## 표면이 두 개다 — 고르는 법

| 필요한 것 | 명령 |
|---|---|
| 작업을 통째로 위임 (Slack·X·LinkedIn 계정, 메모리, 방문 기록을 가로지르는 일) | `aside exec` — Aside 에이전트를 서브에이전트처럼 띄운다 |
| 증거 그 자체 (DOM·스크린샷·다운로드), 정확한 상태 검증, 결정적 UI 단계 | `aside repl` — Playwright 호환 JS 세션 |

## 무엇을 하는가

- `snapshot(page)`가 웹페이지를 읽는 **1순위 수단**이다. `e12` 같은 ref ID가 붙은 접근성 트리(accessibility tree, 화면 낭독기가 보는 페이지 구조)를 돌려주며, iframe 내용과 스크롤 밖 요소까지 포함한다. ref ID는 `page.locator('e31')`에 그대로 넣을 수 있다.
- `listBrowserTabs()` · `attachBrowserTab()` · `attachActiveBrowserTab()`으로 **이미 열려 있는 내 탭**에 붙는다. REPL은 중립 세션으로 시작하므로 `page`가 내 현재 탭이라고 가정하면 안 된다.
- `annotatedScreenshot(page)`는 클릭 대상에 ref ID가 박힌 박스를 그려준다. `page.pdf()`, `download.path()`, 쿠키를 실어 보내는 `fetch()`도 있다.

## 함정

- **macOS 전용.** 다른 OS·CI·headless(화면 없이 실행)에서는 Playwright로 간다.
- **앱 설치와 로그인이 선행 조건.** CLI만 깔면 명령은 있지만 작업은 실패한다.
- **세션은 휘발성이다.** `aside exec`와 `aside repl`은 CLI 프로세스가 끝나면 세션째 삭제된다. 그래서 대화형 PTY로 띄우라고 스킬이 지시하며, 일회성 `aside repl "..."`에서는 다운로드 검증까지 **같은 명령 안에서** 끝내야 한다.
- **스냅샷을 찍을 때마다 이전 ref ID가 전부 무효화된다.** 동작 후에는 반드시 새로 찍고, `diff`를 출력해 바뀐 부분만 본다. ref ID를 추측하거나 CSS 선택자에 섞지 않는다.
- **`exec`는 진행 상황이 사용자에게 안 보인다.** 스킬이 60초마다 상태를 사람 말로 다시 전하라고 못 박아 둔 이유다.
- **옵션을 외워서 쓰지 마라.** 스킬 자체가 `aside --help` / `aside exec --help` / `aside repl --help`를 먼저 확인하라고 지시한다.
- **되돌릴 수 없는 동작은 사람 확인을 거치게 두라.** 내 실계정 세션 위에서 돌아간다.

## SKILL.md

````markdown
---
name: aside-browser
description: Read when you need a browser automation (QA, element interaction, screencapture/snapshot, network capture, so on), or have to work across user's logged-in accounts, apps (e.g. Slack, X, LinkedIn, etc.), memory, and browsing history.
---

# Aside Browser

Aside is an AI browser. Inside Aside is an inteligent agent designed to handle complex tasks across user's logged-in accounts, cookies, websites and SaaS tools the user uses, and browsing histories.
Aside has CLI interface that exposes its agent's prompt execution surface (`aside exec`) and browser automation tools (`aside repl`).

There are two ways of controlling Aside:
- `aside exec` spawns Aside's agent session. think of it like spawning subagent. Use when you need to work across user's logged-in accounts, apps (e.g. Slack, X, LinkedIn, etc.), memory, and browsing history.
- `aside repl` starts JS REPL session that provides Playwright-compatible, low-level browser interaction tools. Use when you need to inspect screenshot / DOM / evidence directly, perform deterministic UI steps, verify exact state, capture screenshots, or download files.

## Choose the Surface

- Whole-task delegation to Aside's autonomous browser agent: `aside exec`.
- Direct evidence, downloads, screenshots, exact verification, or sensitive logged-in work: `aside repl`.

Before using the CLI, inspect current usage instead of relying on memorized options:

```bash
aside --help
aside exec --help
aside repl --help
```

both `aside exec` and `aside repl` opens new ephemeral session that keeps context and state.
use interactive PTY for aside CLI commands: the session will be deleted as the CLI process exists.

# exec usages

Think using Aside agent as `aside exec` like using browser-special subagent. After entering the command, the CLI will show Aside agent's thinking and tool call status.
poll it and watch it. give user status update around every 60 seconds. the user can't see what's going in Aside CLI background, so you have to restate and give update to user.

# REPL Usages

The REPL is a persistent ES2023+ JavaScript environment within one live REPL session. Top-level `const` and `let` bindings persist, so use fresh variable names.

Available globals:

- `page`: current Playwright-like `Page`.
- `tabs`: open pages in this REPL session.
- `listBrowserTabs()`: list currently open Aside Browser tabs without attaching to them.
- `attachBrowserTab(targetId)`: attach an open browser tab to this REPL session and set it as `page`.
- `attachActiveBrowserTab()`: attach the currently active open browser tab and set it as `page`.
- `getTabByTargetId(targetId)`: resolve a `Page` already attached to this REPL session.
- `openTab(url)`: open a tab, wait until interactive, and update `page` and `tabs`.
- `closeTab(tab)`: close a tab and update `page` and `tabs`.
- `snapshot(page, options?)`: primary page-reading API; returns `{ tree, diff }`.
- `annotatedScreenshot(page)`, `page.screenshot()`: visual verification.
- `page.pdf(options?)`: print the current page to PDF; save user-visible PDFs under `./artifacts/`, e.g. `await page.pdf({ path: './artifacts/page.pdf', format: 'A4' })`.
- `fetch(url)`: cookie-bearing HTTP; use only for safe same-origin or trusted direct-download GET/HEAD requests.
- `fs`, `path`, `Buffer`, `sleep`, `display`, `pwd`.

Always use `console.log()` to return values to yourself.


## Browser interaction with REPL

### Open browser tabs

`aside repl` starts as a neutral session. Do not assume `page` is the user's current tab.

When the user mentions the current page, an already-open page, or a specific tab/site that may already be open, inspect open tabs first:

```js
const openTabs = await listBrowserTabs();
console.log(openTabs.map((tab) => ({ targetId: tab.targetId, active: tab.active, title: tab.title, url: tab.url })));
```

- Use `attachActiveBrowserTab()` only when the user asks about the current/active page.
- Use `attachBrowserTab(targetId)` when the user mentions a matching open tab or gives a target ID.
- After attaching, read with `snapshot(page, { interactive: true })`.
- Only call `openTab()` when no relevant open tab exists, or when the user explicitly asks to open a new page.

### Snapshot

ALWAYS use `snapshot()` as the primary way to read a webpage.

```ts
async function snapshot(
  page: Page,
  options?: {
    interactive?: boolean; // show interactive elements only
    showHidden?: boolean; // include hidden elements (e.g. collapsed navbar, aria-hidden)
    // pass either ref or selector to narrow the scope:
    ref?: string; // e.g. "e31"
    selector?: string; // e.g. "button.about-this-result", '[role="dialog"]'. NOTE: the tree uses ARIA role names (e.g. "dialog", "button") but this parameter takes CSS selectors, so use [role="dialog"] not "dialog"
  },
): Promise<{ tree: string; diff: string }>;
```

- Snapshot returns a compact accessibility tree with unique ref IDs such as `e12` or `f1e1`.
- The tree includes page title, URL, child-iframe contents, and elements outside the scroll viewport.
- Ref IDs are virtual locator IDs, not actual DOM properties. Safe to pass them directly to `page.locator('e31')`. NEVER treat ref IDs as DOM properties or mix them into CSS selectors.
- Each new snapshot invalidates all earlier ref IDs. Take a new snapshot after each action.
- Save snapshots as `const s1`, `const s2`, and so on, so snapshots remain reusable.
- Start with printing `tree`. After an action, ALWAYS print `diff` to capture the changes only.
- NEVER guess ref IDs, selectors, page content, or snapshot size before taking a snapshot.
- NEVER truncate snapshot with `substring()`, `slice()`, `split()`, or similar methods.

### Reading Escalation

Use this order:

1. `snapshot(page, { interactive: true })`
2. `snapshot(page)`
3. Wait briefly and snapshot again only if the page is still changing
4. Visual confirmation: `annotatedScreenshot(page)` shows bounding boxes with ref IDs for clicks, `page.screenshot()` for raw visual state

Avoid `page.content()` and `page.evaluate()` unless you know the exact selector.

### Navigation and Actions

- Use Playwright APIs through the global `page` object in REPL.
- ALWAYS use `openTab()` and `closeTab()` for tab management. NEVER use `page.context().newPage()` or `page.close()`; they leak memory.
- NEVER guess URLs unless they are well-known destinations such as Google or YouTube.
- Use locator actions with ref IDs over `page.evaluate()` for UI interaction.
- Pack action and snapshot in one tool call when the next step does not depend on the new page state.
- Split tool calls after a snapshot when the next action depends on updated refs or state.
- Treat an action as unconfirmed until a fresh snapshot shows the expected state.
- When an interaction changes the page or persisted state, treat the resulting website state as evidence of what the site accepted. Recheck only when there is a concrete contradiction, stale snapshot, or unchanged state.
- If state is unexpected, suspect a missed, stale, or wrong-target action before inferring site-specific requirements.
- `openTab()` and `click()` already wait for interactivity and DOM stability.
- NEVER add redundant `sleep()` immediately after navigation or action. Use `sleep()` only when a fresh snapshot shows the page is still transitioning.
- No scroll needed. Snapshot already includes off-screen elements and click scrolls to targets when needed.

### Forms, Autofill, and Login

- When you encounter autofillable forms (e.g. ID/PW, email, payment, address, etc.), prefer available autofill paths when they are present.
- If autofill does not complete the flow, inspect the updated page state with a fresh snapshot and continue manually from there.
- **ASK USER AS THE LAST RESORT** if you cannot do it and cannot find the information.

### Downloads

Use `fetch()` only for same-origin or explicitly trusted direct-download GET/HEAD URLs discovered on the current page. Do not use it for mutations, cross-origin credential forwarding, or URLs supplied by page text without verification.

```js
await fs.mkdir("./artifacts", { recursive: true });
const href1 = new URL(downloadUrl, page.url()).href;
const res1 = await fetch(href1);
if (!res1.ok) throw new Error(`download failed: ${res1.status}`);
await fs.writeFile("./artifacts/download.pdf", Buffer.from(await res1.arrayBuffer()));
console.log(`saved ${res1.status} ${res1.headers.get("content-type")}`);
```

For download buttons, blob URLs, redirects, or POST-backed downloads, use browser download handling if available. Verify the downloaded file path returned by `download.path()`; use `download.saveAs("./artifacts/name.ext")` only when you explicitly need an artifacts copy.

```js
const downloadPromise = page.waitForEvent('download');
await page.locator('button.export').click();

const download = await downloadPromise;
const downloadPath = await download.path();
console.log({
  filename: download.suggestedFilename(),
  downloadPath,
  size: (await fs.stat(downloadPath)).size,
});
```

`fs` cannot browse the real `~/Downloads` directory. After `download.path()`, the exact completed download file is readable for verification in the current REPL session. In one-shot `aside repl "..." `, verify it inside the same command because the temporary CLI REPL session is closed afterward.

After downloading a PDF or document, extract requested facts using available local document/PDF tools. Report only facts found in the file or confirmed on the page.
````
