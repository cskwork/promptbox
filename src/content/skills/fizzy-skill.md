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
description: Use when working with a self-hosted Fizzy kanban board — install/auth fizzy-cli, list boards/cards, create/update/comment cards, or migrate a Jira issue (description + attachment URLs + comments) into one or more Fizzy cards. Covers Fizzy quirks (NO markdown rendering, silent pagination in comment list, single-account auto-select, magic-link in non-TTY) and Jira ADF → Fizzy plain-text conversion.
---

# fizzy

Single skill covers:
1. Onboarding — install, base-URL, auth (PAT or magic-link), default account
2. Daily ops — board/card/comment CRUD with the markdown gotchas baked in
3. Jira → Fizzy migration — pull issue + attachments + comments into card(s)

## Quick decision
- Need to set up fizzy-cli from scratch?         → §1 Onboarding
- Need to create/update cards or comments?       → §2 Daily ops
- Need to import a Jira issue into Fizzy?        → §3 Jira → Fizzy migration
- Markdown looks broken after posting to Fizzy?  → §4 Markdown quirks

## Inputs (env)
FIZZY_HOST, FIZZY_EMAIL, FIZZY_TOKEN (preferred) OR magic-link

## §4 Rendering — Fizzy accepts HTML, NOT markdown
CRITICAL: Fizzy server takes body as HTML and auto-converts. Markdown is NOT
parsed — `**bold**` appears as literal asterisks. Send hybrid HTML.

Auto-renders well: <p>, <ul>/<ol>/<li>, nested <ul>, <blockquote>, <br>
STRIPS: <h1-6>, <strong>, <em>, <hr>, <a href>, <img>, <pre>/<code>, <table>

Workarounds:
- headings → `<p>▶ <strong>title</strong></p>` (emoji marker)
- <hr> → `<p>━━━━━━━━━━━━</p>`
- <a href> → `<p>label: URL</p>` (URL must be visible text)
- <img> → `<p>이미지: <url></p>`
- <table> → `<p>| a | b |</p>` rows

## Common mistakes
- Sending markdown and hoping it renders
- Trusting comment list length (it's page 1 only — loop)
- Filtering by creator.name != "System" (some events have empty creator.name)
- Posting via bash -c with backticks in --description
- <a href> for important URLs (Fizzy strips the href)
- <table> for important tabular data (cells concatenated with no separator)

(Full text + Jira migration scripts: https://github.com/cskwork/fizzy-skill)
````
