---
title: create-verification-skill
title_en: Create verification skill
summary: "레포를 인터뷰해서 그 프로젝트 전용 검증 스킬을 생성하는 메타 스킬. 앱을 실제로 띄우고, 사용자가 하듯 기능 하나를 조작하고, 증거를 남기는 절차를 레포의 스킬 디렉터리에 써 준다. 생성기가 스스로 한 번 돌려보고 통과해야 인도하며, 돌려보지 않은 결과물은 초안으로 취급한다."
summary_en: "A meta-skill that interviews the repo and writes a verification skill tailored to it: how to launch the real app, drive one feature the way a user would, and capture proof. The generator must run its own output end to end before handing it over, and a skill that was never executed counts as a draft."
tags: [skill, verification, qa, meta-skill, feature-map, evidence, pstack, cursor]
source: https://github.com/cursor/plugins/tree/main/pstack/skills/create-verification-skill
author: Lauren Tan (poteto)
license: MIT
order: 22
trigger: "/create-verification-skill · 이 레포용 조작 스킬 만들어줘 · 프로젝트에 UI/CLI/서비스 동작을 증명할 스크립트 경로가 없을 때. disable-model-invocation이 걸려 있어 자동 호출되지 않고 명시적으로 불러야 한다."
install: "/add-plugin pstack (Cursor). references/feature-map-example/ 3개 파일이 필요하므로 디렉터리 전체를 가져온다."
---

## 한 줄

검증 절차를 직접 실행하는 스킬이 아니라, 검증 스킬을 써 주는 스킬이다. 레포를 읽어 표면(웹 UI,
CLI, 서비스, 데스크톱)과 실행 방법과 조작 수단을 파악한 뒤, `verify-<app>/` 아래에 그 프로젝트
전용 스킬과 기능 지도를 생성한다. 원문은 이 경로를 `.cursor/skills/`로 고정한다.

## 언제 쓰는가

- 앱 동작을 증명할 스크립트 경로가 아예 없는 레포에 진입했을 때
- 범용 검증 스킬이 스택마다 어댑터를 손으로 써야 해서 실제로 안 돌 때
- 에이전트가 매번 "이 앱 어떻게 띄우지"부터 다시 알아내는 비용을 없애고 싶을 때

## 무엇을 하는가

1. **사용자가 아니라 레포를 인터뷰한다.** 표면, 실행 명령, 조작 수단(기존 Playwright 스펙, expect
   스크립트, PTY 헬퍼, curl 가능한 엔드포인트, 디버그 포트를 먼저 찾고 그다음에 범용 레시피),
   관측 가능한 증거, 인스턴스 격리 가능 여부. 코드에서 알아낼 수 없는 것만 사람에게 묻는다.
2. **스킬을 생성한다.** Launch, Doctor, Drive, Evidence, Cleanup, Helpers 6개 절. 예시가 아니라 이
   레포의 실제 셀렉터와 명령이 들어가야 하고, 플레이스홀더를 남기면 안 된다.
3. **기능 지도를 만든다.** `features/README.md` + 기능당 파일 하나. 각 파일은 H2 4개 고정:
   `Sub-features`, `How to get to it (user POV)`, `Driving it with <harness>`, `Gotchas`.
4. **생성물을 직접 돌려본다.** 띄우고, doctor 돌리고, 지도에 있는 기능 하나를 조작하고, 증거를
   남기고, 정리한다. 정리 후에도 증거가 그 자리에 있어야 통과다.

## 함정

- **읽는 대상이 사람이 아니라 다음 에이전트다.** 스킬 본문이 명시한다. 앱을 한 번도 본 적 없는
  에이전트가 작업 도중에 이 문서 하나만 열고 바로 실행한다는 전제로 써야 한다.
- **정리가 증거를 먹으면 실패다.** Cleanup은 인스턴스와 임시 상태만 지우고 증명 산출물은 남긴다.
  프로세스 이름으로 kill하지 말고 자기가 띄운 것만 죽인다.
- **dry-run을 이름만 믿지 않는다.** 무엇을 건너뛰는지 파일·네트워크·git ref를 관측해서 확인하라고
  요구한다. 어떤 dry-run은 여전히 네트워크를 치거나 브라우저를 연다.
- **frontmatter 없으면 스킬이 등록조차 안 된다.** 생성물에 `name: verify-<app>`과 description을 넣는다.
- **자동 호출이 꺼져 있다.** `disable-model-invocation: true`라서 모델이 알아서 부르지 않는다.
  사용자가 이름으로 호출해야 한다.
- **생성 경로가 원문에서는 Cursor 고정(`.cursor/skills/`)이다.** 아래 "하네스 중립으로 쓰기" 참고.
- 유지보수는 짝 스킬 `/maintain-verification-skill`이 맡는다. 앱이 바뀌면 기능 지도가 먼저 낡는다.
  pstack 플러그인 전체를 설치하지 않았다면 이 짝 스킬은 없다.

```markdown
---
name: create-verification-skill
description: "Generate a project-local verification skill that drives your app the way a user does — any language, framework, or platform. Use for /create-verification-skill, \"make a control skill for this repo\", or when a project has no scripted way to prove UI/CLI/service behavior."
disable-model-invocation: true
---

# Create a verification skill

Every serious project needs a scripted way to drive the real app and prove behavior: launch it, exercise a feature the way a user would, and capture evidence. This skill generates that as a project-local skill (`.cursor/skills/verify-<app>/`) tailored to the repo. You write the generator's output for the next agent, not for a human: it will be read cold, mid-task, by an agent that has never seen the app.

## 1. Interview the repo, not the user

Answer these from the codebase and only ask the user what you cannot observe:

- **Surface:** what does a user actually touch? A web UI, a CLI/TUI, a desktop app, an API, a mobile app, a library? A repo can have several; pick the primary one and note the rest.
- **Run:** how does the app start locally? Prefer the repo's own documented dev command (package scripts, Makefile, README quickstart). Note ports, env vars, seed data, auth.
- **Drive:** how can an agent interact with it programmatically? Existing harnesses first — Playwright/Cypress specs, expect scripts, PTY helpers, curl-able endpoints, a debug port. Only then pick a generic recipe: browser/CDP for web and Electron, a tmux/PTY harness for CLI/TUI, plain HTTP for services.
- **Observe:** what evidence can be captured? Screenshots, terminal transcripts, response bodies, logs, exit codes, DB state.
- **Isolate:** can two instances run side by side (ports, data dirs, profiles)? If not, say so in the generated skill: refusing to double-drive a shared instance beats corrupting the user's session.

If the checkout doesn't build or start as-is, fix that first (or report it precisely) before generating; a skill written against a broken base teaches wrong steps. When an irrelevant missing asset blocks startup (a static dir the API never serves, a sample config), the generated skill may create it, clearly marked as verification scaffolding, and remove it in cleanup.

## 2. Generate the skill

Write `.cursor/skills/verify-<app>/SKILL.md` with YAML frontmatter (`name: verify-<app>` and a `description` that names the app, the surface, and when to reach for it — without frontmatter the skill never registers) and these sections, each grounded in what the interview actually found (no placeholders left):

- **Launch:** the exact command that starts the app for verification, and how to tell it's ready (a log line, a port answering, a prompt). Include teardown. For a short-lived CLI or TUI there is no server to keep alive: launch means build the binary (or install deps) once, then start each drive in its own isolated PTY or tmux session.
- **Doctor:** one read-only check that answers "is this instance worth driving?" — process up, right version/build, port owned by us, auth valid. An agent runs this first whenever anything looks off.
- **Drive:** the harness recipe with real selectors/commands from this repo, not examples. Prefer stable handles (ARIA labels, data attributes, prompt strings, route paths) over coordinates and tab order.
- **Evidence:** what to capture for a proof and where it goes. State the proof standards: exercise the real user path, not internal setters or test-only endpoints; capture the action and the resulting state, not just the final screen; verify side effects (files written, rows inserted, messages sent) alongside what's visible; mocks only where a production boundary already isolates the external system. When the safe path is a dry-run or test mode, verify what it actually skips by observing (files, network, git refs) rather than trusting its name: some dry-runs still touch the network or open a browser.
- **Cleanup:** how to tear down instances the run created. Never kill by process name; kill what you started. Cleanup removes instances and scratch state, never the evidence: proof artifacts survive the teardown, in a location the skill names.
- **Helpers:** any script the skill ships is executable and its invocation is shown in the skill body. A helper the reader has to reverse-engineer is not a helper.

## 3. Seed the feature map

Create `.cursor/skills/verify-<app>/features/README.md` plus one file per user-facing feature you can identify (aim for the top 3-5 to start, from routes, commands, menus, or docs). Follow the shape in [`references/feature-map-example/`](references/feature-map-example/), with a README index and one file per feature. Each file answers, from the user's point of view: what the feature is, how to reach it, how to drive it with the harness, and what observable end state proves it works. The four H2s are `Sub-features`, `How to get to it (user POV)`, `Driving it with <harness>`, and `Gotchas`. The map is the repo's maintained verification source; a proof that drives one convenient entry point is incomplete when the map lists others.

## 4. Prove the generated skill before handing it over

Run its own instructions end to end once: launch, doctor, drive ONE mapped feature (one is enough; the map exists so later runs can cover the rest), capture evidence, clean up. After cleanup, confirm the evidence still exists at the named location — a cleanup that eats the proof fails this step. Fix what fails, and run the generated cleanup after every failed iteration too, so broken attempts don't strand processes and ports. A generated skill that was never executed is a draft, not a deliverable.

## 5. Offer the maintenance loop

Point the user at `/maintain-verification-skill` for keeping the map honest as the app changes. Suggest a cadence only if they ask.
```

## 하네스 중립으로 쓰기

원문은 생성 경로를 `.cursor/skills/verify-<app>/`로 세 군데에 박아 뒀다. Cursor 밖에서 쓰려면
그 세 곳을 `<skills-dir>/verify-<app>/`로 바꾸고, 아래 절을 `# Create a verification skill` 다음에
끼워 넣는다. 나머지 본문은 그대로 둬도 된다.

```markdown
## 0. Resolve `<skills-dir>`

The generated skill is harness-neutral, so resolve where it goes before writing anything. Use the first match:

1. A project-local skills directory the repo already has: `.agents/skills/`, `.claude/skills/`, `.codex/skills/`, `.cursor/skills/`, or `.pi/skills/`. When several exist, take the one holding the most skills.
2. Otherwise `.agents/skills/`, the neutral default.

If a second harness's skills directory also exists, symlink the generated skill into it instead of copying, so the two cannot drift. On Windows, copy and say in the report that the copy will drift. Name the resolved path in your final report.
```

`disable-model-invocation: true`는 Cursor frontmatter 키다. 이 키를 모르는 하네스에서는 무시되고
스킬이 자동 호출될 수 있으니, 자동 호출을 막고 싶으면 description에서 트리거 문구를 좁힌다.

## 기능 지도 예시

생성물이 따라야 할 형태는 `references/feature-map-example/`가 보여 준다. 아래는 그 인덱스다.

```markdown
# Notes verification map

This directory is the maintained source for verifying the user-facing behavior of Notes. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch Notes at `http://127.0.0.1:4173` with a disposable data directory.
- Set `NOTES_DATA_DIR=/tmp/notes-verify-$RUN_ID` so concurrent runs do not share state.
- Seed notes titled `Quarterly plan` and `Grocery list`.
- Put `control-notes` and the `notes` CLI on `PATH`.
- Run `control-notes doctor` and require the expected URL, data directory, and build revision.
- Never drive an instance that was not started by this verification run.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or DOM position.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions through `control-notes browser`.
- Run terminal actions through `control-notes cli -- <command>`.
- Restore seeded data after a mutation. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with the app identity visible.
- CLI proof includes the command, stdout, stderr, and exit code.
- Mutation proof includes a read-only second view of the stored value.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with <harness>` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Create a note](./create-note.md) covers browser and CLI creation, cancellation, persistence, and cleanup.
- [Search notes](./search.md) covers toolbar, keyboard, and CLI search with matching, empty, and clear states.
```
