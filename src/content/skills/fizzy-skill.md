---
title: fizzy
summary: 코딩 에이전트가 카드형 작업 보드 Fizzy를 직접 세팅하고, Jira 이슈를 글·첨부·댓글까지 그대로 옮겨 주는 스킬. Fizzy 특유의 글자 깨짐 함정도 알아서 피한다.
summary_en: "Sets up Fizzy kanban boards and migrates Jira issues — with the HTML-stripping quirks already handled."
tags: [skill, fizzy, kanban, jira, migration, claude-code, codex]
source: https://github.com/cskwork/fizzy-skill
author: cskwork
license: MIT
order: 40
trigger: "fizzy-cli setup / fizzy 카드 만들기 / Jira → Fizzy 이전 / fizzy 마크다운 안 됨"
install: "git clone https://github.com/cskwork/fizzy-skill ~/.claude/skills/fizzy"
hidden: true
---

## 한 줄

Fizzy는 마크다운 렌더러가 아니다 — HTML을 받지만 `<h*>`, `<strong>`, `<hr>`, `<a href>`, `<img>`, `<pre>`, `<table>` 다 strip(태그를 떼어버림)한다. 이 스킬은 그 함정들을 결정 트리로 굳혀놨다.

*EN: Fizzy quietly strips most HTML tags, so this skill bakes the safe formatting tricks into a ready-made decision tree.*

## 다루는 것

1. **Onboarding(초기 설정)** — 설치, base URL, 인증(PAT(개인 액세스 토큰) 또는 매직링크), 기본 계정 설정
2. **Daily ops(일상 작업)** — 보드·카드·댓글 CRUD(생성·조회·수정·삭제) + 마크다운 함정 회피
3. **Jira → Fizzy 마이그레이션** — Jira 이슈의 설명·첨부·14개 댓글을 카드(+서브카드)로 옮기되 포맷 유지

## Fizzy의 함정 (한 번에)

| 함정 | 증상 | 처방 |
|---|---|---|
| 마크다운 미렌더링 | `**bold**`가 별표 그대로 | HTML(hybrid) 사용 — `scripts/adf_to_fizzy.py` |
| `--json` 위치 | subcommand 뒤에 두면 무시 | **앞에** 두기: `fizzy-cli --json comment list 36` |
| `comment list` 페이지네이션 | ~3개만 반환, 나머지 보이지 않음 | 비어질 때까지 loop(반복) |
| 단일 계정 자동 선택 안 됨 | `board list`가 cryptic(알아보기 힘든) 에러 | 계정 1개여도 `account set <SLUG>` 필수 |
| 비-TTY 매직링크 | 매 호출마다 새 코드 발급, 받은 건 무효화 | `references/magic-link-curl-two-step.md` 워크어라운드 |
| `<a href>` strip | URL이 사라짐 | `<p>label: URL</p>`로 보이게 |
| `--image` | 카드당 메인 이미지 1개만, 본문 `<img>` strip | 한 장만 메인으로, 나머지는 텍스트 URL |
| heredoc(여러 줄 입력 블록) + backtick | shell substitution(셸이 명령을 멋대로 실행) 발생 | Python `subprocess.run([...])`로 빌드 |

## 환경 변수

- `FIZZY_HOST` (예: `https://fizzy.example.com`)
- `FIZZY_EMAIL`
- `FIZZY_TOKEN` (PAT 권장) 또는 매직링크

Jira 첨부: `ATLASSIAN_EMAIL` + `ATLASSIAN_PAT` + `ATLASSIAN_SITE` (acli OAuth는 `read:attachment-content:jira` 없음 → Basic auth(아이디·토큰을 직접 보내는 기본 인증)로 직접).

## 핵심 명령

```bash
fizzy-cli config set --base-url "$FIZZY_HOST"
fizzy-cli auth login --token "$FIZZY_TOKEN"
fizzy-cli account set <SLUG>             # 1개여도 필수
fizzy-cli board list
fizzy-cli --json comment list <N>        # --json은 subcommand 앞
```

## Jira → Fizzy 마이그레이션 흐름

```bash
python3 ~/.claude/skills/fizzy/scripts/jira_to_fizzy.py \
  --issue PROJ-123 \
  --board <fizzy-board-id> \
  --site your-site.atlassian.net \
  --split-numbered
```

1. `mcp__claude_ai_Atlassian__getJiraIssue`로 이슈+댓글 JSON 수집 (`--from-json` 로 캐시 가능)
2. ADF → Fizzy-friendly HTML (`scripts/adf_to_md.py` / `adf_to_fizzy.py`)
3. 부모 카드 생성 (요약 + Jira URL + 첨부 링크)
4. `--split-numbered`면 설명의 top-level 번호 항목마다 서브카드
5. 모든 Jira 댓글을 `**[YYYY-MM-DD] author**\n\n<body>` 형태로 post
6. fizzy-cli 호출은 `context deadline exceeded` 시 3회 retry

## 권장 카드 레이아웃 (이모지 금지, 박스 드로잉)

```html
<p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
<p>[KEY] 제목 영역</p>
<p>프로젝트: MyProject  ·  타입: Bug  ·  상태: 진행 중  ·  담당: 홍길동</p>
<p>Jira: https://...</p>
<p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
<p>[개요]</p>
<p>본문 단락 1</p>
<ul><li>핵심 1</li><li>핵심 2</li></ul>
<p>[첨부 (로그인 필요)]</p>
<ul><li>오류 화면: https://...</li></ul>
```

## SKILL.md 본문 (복사용 — 핵심 발췌)

````markdown
---
name: fizzy
description: Operate a self-hosted Fizzy kanban board via fizzy-cli. Use when setting up fizzy-cli, creating or updating Fizzy cards and comments, or migrating Jira issues to Fizzy.
---

# fizzy

Operate `tobiasbischoff/fizzy-cli` against a **self-hosted Fizzy instance**. Single skill covers:

1. **Onboarding** — install, base-URL, auth (PAT or magic-link), default account
2. **Daily ops** — board/card/comment CRUD with the rendering gotchas baked in
3. **Jira → Fizzy migration** — pull a Jira issue's description, attachments, and comment thread into a card (+ sub-cards) without losing formatting

## Quick decision

```
Need to set up fizzy-cli from scratch?         → §1 Onboarding
Need to create/update cards or comments?       → §2 Daily ops
Need to import a Jira issue into Fizzy?        → §3 Jira → Fizzy migration
Markdown looks broken after posting to Fizzy?  → §4 Rendering
```

## Inputs (env)

- `FIZZY_HOST` — base URL (e.g. `https://fizzy.example.com`)
- `FIZZY_EMAIL` — account email
- `FIZZY_TOKEN` (preferred) OR an authorized magic-link flow

Operate only on the requested host/account/board and actions. Setup does not authorize comments, migration, or deletion. Never print token/config contents; recover auth through the supported user flow.

For Jira import: `acli` must be authenticated to the source site (`acli auth status` → ✓).

---

## §1 Onboarding

### 1.1 Install

Homebrew (documented):
```bash
brew install tobiasbischoff/tap/fizzy-cli
```

If brew is blocked, build from source:
```bash
git clone https://github.com/tobiasbischoff/fizzy-cli.git ~/.local/src/fizzy-cli
cd ~/.local/src/fizzy-cli && go build -o ~/.local/bin/fizzy-cli ./cmd/fizzy-cli
```

> **Pitfall — `go install` does NOT work.** `go.mod` declares `module fizzy-cli` (short form), so `go install github.com/...` fails. Always clone + `go build -o`.

### 1.2 Point at the host
```bash
fizzy-cli config set --base-url "$FIZZY_HOST"
fizzy-cli config show
```
Config: macOS `~/Library/Application Support/fizzy/config.json`, Linux `~/.config/fizzy/config.json`.

### 1.3 Authenticate

**A. PAT (preferred, idempotent):**
```bash
fizzy-cli auth login --token "$FIZZY_TOKEN"
fizzy-cli auth status   # → "Authenticated using token."
```

**B. Magic-link in non-TTY (Claude Code / CI):**
> `fizzy-cli auth login --email --code` is broken in non-TTY — each call re-issues a code, invalidating any pasted one. Workaround: see `references/magic-link-curl-two-step.md`.

### 1.4 Pick default account
```bash
fizzy-cli account list
fizzy-cli account set <SLUG>    # required even with only one account
```

> **Pitfall — single-account auto-select is NOT done by the CLI.** Skipping this makes `board list` etc. error cryptically.

### 1.5 Verify
```bash
fizzy-cli board list
fizzy-cli card list --board-id <ID>
# Create a test card only if the user requested a write-path check.
```

---

## §2 Daily ops

| Goal                 | Command |
|----------------------|---------|
| List boards          | `fizzy-cli board list` |
| List cards           | `fizzy-cli card list --board-id <ID>` |
| Get card             | `fizzy-cli card get <N>` |
| Create card          | `fizzy-cli card create --board-id <ID> --title T --description D --status published` |
| Update card          | `fizzy-cli card update <N> --description D` |
| Attach main image    | `fizzy-cli card update <N> --image <local-path>` (one image per card) |
| List comments (JSON) | `fizzy-cli --json comment list <N>` |
| Add comment          | `fizzy-cli comment create <N> --body "text"` |
| Delete comment       | `fizzy-cli comment delete <N> <comment-id>` |

> `--json` is a **global** flag — it must come before the subcommand (`fizzy-cli --json comment list 36`), not after.

### Filter user-only comments

Match the exact author name. Status-change events arrive as comments whose `creator.name` is `"System"` or empty, so a `!= "System"` filter lets some through.

```bash
fizzy-cli --json comment list <N> \
  | jq -r --arg u '<username>' '.[] | select(.creator.name == $u) | .id'
```
`list_user_comments()` in `scripts/jira_to_fizzy.py` applies the same exact-match rule.

### Card description / comment body — send HTML

Fizzy takes the body as HTML and strips most tags; markdown is not parsed. Read §4 before writing your first `--description` or `--body`, or build the body with `scripts/adf_to_fizzy.py`, which already emits the strip-safe forms.

---

## §3 Jira → Fizzy migration

End-to-end migrator: reads an issue + comments JSON dump, converts ADF → Fizzy hybrid HTML, creates parent card + optional sub-cards, posts every comment, retries on timeout.

Dump the issue yourself first — the migrator has no fetch path. Pull it with Atlassian MCP `mcp__claude_ai_Atlassian__getJiraIssue` (or `acli`) and save the JSON.

```bash
# Prereq: Fizzy authenticated (§1), Atlassian MCP available, acli logged in
python3 scripts/jira_to_fizzy.py \
  --from-json /tmp/PROJ-123.json \
  --board <fizzy-board-id> \
  --site your-site.atlassian.net \
  --split-numbered   # auto-create sub-cards from "1.", "2.", "3." in description
```

`--from-json`, `--board`, and `--site` are all required on a migration run.

What it does (see `scripts/jira_to_fizzy.py` for the full flow):
1. Reads the issue + comments JSON from `--from-json PATH`.
2. Converts every ADF body to Fizzy hybrid HTML via `scripts/adf_to_fizzy.py`.
3. Creates the parent card (compact summary + Jira URL + link to attachments).
4. If `--split-numbered`, creates one sub-card per top-level numbered item in the description.
5. Posts every Jira comment under an `━` rule plus an author · date header line, body converted to hybrid HTML.
6. Retries each fizzy-cli call up to 3× on `context deadline exceeded`.

**Attachment handling (images):** Atlassian's `acli` OAuth scope lacks `read:attachment-content:jira`, so URL-based downloads return 401. Use a user-issued **Personal Access Token (PAT)** with Basic auth (`scripts/atlassian_attachments.py`).

Setup once:
1. Issue a PAT at `https://id.atlassian.com/manage-profile/security/api-tokens`
2. Save to `~/.config/fizzy/.env` (chmod 600):
   ```
   ATLASSIAN_EMAIL=you@example.com
   ATLASSIAN_PAT=ATATT3...
   ATLASSIAN_SITE=your-site.atlassian.net
   ```

Download + attach:
```bash
# Download every attachment to /tmp/fizzy-attachments/
python3 scripts/atlassian_attachments.py \
    download-issue --from-json /tmp/issue.json

# Then attach a representative image as the card's main image (one per card)
fizzy-cli card update <N> --image /tmp/fizzy-attachments/<id>_<name>.png
```

Note: Fizzy strips `<img>` from description bodies, so embed-in-description is impossible — only the card's main image slot works (one image per card).

**Reruns:** inspect existing cards/comments before retrying. The migrator's timeout retry can duplicate writes; a timeout does not prove nothing was created.

For approval to remove specific comments, resolve and preserve the approved card/comment IDs, then delete only those IDs individually using the command shape used by the helper:

```bash
fizzy-cli comment delete <approved-card-number> <approved-comment-id>
```

Verify the installed CLI syntax before execution and read back the remaining comments. Do not substitute a display-name wipe for an approved ID list.

The broad helper below is only for explicit authorization to delete **all comments matching the exact creator display name on this card**, including matches found on repeated listings. It is not bound to a reviewed snapshot: comments appearing later during the run can also be deleted, and distinct people can share a display name. The implementation re-lists for up to 50 rounds; it does not accept an approved-ID set.

```bash
python3 scripts/jira_to_fizzy.py --card <N> --site your-site.atlassian.net --wipe-user-comments <username>
```

Use that helper only when its full selection behavior is authorized. It is not an idempotency mechanism.

---

## §4 Rendering — Fizzy accepts HTML, NOT markdown

> **CRITICAL discovery (2026-05-21):** Fizzy server takes the body as HTML and auto-converts it to a Fizzy-rendered string. Markdown is NOT parsed — `**bold**` appears as literal asterisks. **Send hybrid HTML** for the best result.

### What Fizzy auto-renders well (use these tags)

| Tag | Result in UI |
|---|---|
| `<p>...</p>` | paragraph with blank-line separation |
| `<ul><li>X</li></ul>` | `• X` (auto bullet) |
| `<ol><li>X</li></ol>` | `1. X` (auto numbering) |
| nested `<ul>` inside `<li>` | `  • X` (auto 2-space indent) |
| `<blockquote>X</blockquote>` | `“X”` (auto curly quotes) |
| `<br>` | line break inside paragraph |

### What Fizzy STRIPS (encode in text yourself)

| Tag | Fizzy behavior | Workaround |
|---|---|---|
| `<h1>`…`<h6>` | shown as plain text, no marker | wrap: `<p>[TITLE]</p>` — bracket label as the marker |
| `<strong>` / `<em>` | stripped | use `「 」` symbols if emphasis matters |
| `<hr>` | disappears | emit `<p>━━━━━━━━━━━━━━━━━━━━</p>` |
| `<a href="X">label</a>` | text only, **URL is gone** | emit `<p>label: X</p>` |
| `<img>` | disappears | emit `<p>이미지: <url></p>` |
| `<pre>`/`<code>` | stripped | emit `<p>코드:</p><p>…</p><p>---</p>` |
| `<table>` | all cells concatenated, no structure | emit rows as `<p>\| a \| b \|</p>` |

### Other quirks

| Quirk | Symptom | Fix |
|---|---|---|
| `comment list` silent pagination | Only ~3 items per call; the rest are invisible | Loop list+delete until empty when wiping; never assume `length == total` |
| Bash heredoc + `(` / backtick | `unexpected EOF` or `command not found` | Build bodies in Python with `subprocess.run([cmd, '--description', text])` |
| `--json` after subcommand | Silently ignored | Place it **before** subcommand: `fizzy-cli --json comment list 36` |
| Single-account auto-default | `board list` errors after fresh auth | Run `fizzy-cli account set <SLUG>` even with one account |
| `--image PATH` | Local file path only, one main image per card | Download first; extras → inline URLs in description |

## Recommended layout for migrated cards

> **POLICY — deliverables carry no emoji.** Cards, comments, and reports are business
> artifacts: mark structure with bracket labels (`[목적]`, `[상세 작업]`) and box-drawing
> rules (`━`, `·`). Geometric arrows (`▶ ▸ ■`) count as emoji here — some clients render
> them with emoji presentation.

```html
<p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
<p>[KEY] 제목 영역</p>
<p>프로젝트: MyProject  ·  타입: Bug  ·  상태: 진행 중  ·  담당: 홍길동</p>
<p>Jira: https://...</p>
<p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
<p>[개요]</p>
<p>본문 단락 1</p>
<ul><li>핵심 1</li><li>핵심 2</li></ul>
<p>[첨부 (로그인 필요)]</p>
<ul><li>오류 화면: https://...</li></ul>
```

This is what `scripts/adf_to_fizzy.py` + `header_block()` / `section()` produce automatically.

## Files

- `scripts/adf_to_fizzy.py` — **(recommended)** ADF → Fizzy hybrid HTML with auto-renderable tags + text fallbacks for stripped ones. Provides `adf_to_fizzy()`, `header_block()`, `section()`, `HR`.
- `scripts/adf_to_plain.py` — ADF → pure plain text (use only when you specifically want to avoid HTML).
- `scripts/adf_to_md.py` — ADF → markdown (for non-Fizzy targets; do NOT send to Fizzy).
- `scripts/jira_to_fizzy.py` — end-to-end Jira issue → Fizzy card(s) migrator with retry + pagination-safe wipe, using hybrid HTML.
- `references/magic-link-curl-two-step.md` — non-TTY magic-link workaround.
- `references/operations.md` — extended fizzy-cli command reference.
````
