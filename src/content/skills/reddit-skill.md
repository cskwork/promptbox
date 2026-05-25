---
title: reddit-poster (cskwork/reddit-skill)
summary: Reddit에 사람처럼 글 쓰는 Claude 스킬. CLI `reddit-post`가 본체(MCP는 옵션). 4단계 — flair·top5 조회 → 휴먼 톤 draft → dry-run → 사용자 명시 승인 후 post. flair_id 정확 해석, shadow-remove(inbox 확인), megathread redirect, 카르마/스팸 필터까지 다 다룬다.
tags: [skill, claude-code, reddit, mcp, cli, posting, flair, automation]
source: https://github.com/cskwork/reddit-skill
author: cskwork
license: MIT
order: 30
trigger: "post on Reddit / share on r/X / advertise on Reddit / /reddit-poster"
install: "git clone https://github.com/cskwork/reddit-skill && cd reddit-skill && uv sync && mkdir -p ~/.claude/skills/reddit-poster && cp skills/reddit-poster/SKILL.md ~/.claude/skills/reddit-poster/"
---

## 한 줄

`reddit-post` CLI(기본) + 옵션 MCP server + `reddit-poster` SKILL. **널리 쓰이는 Reddit MCP들이 `flair_id`를 잘못 다루는 문제를 고친다** — 텍스트 flair를 받아 `subreddit.flair.link_templates`에서 id를 lookup해서 제대로 제출.

## 4단계 워크플로우 (생략 금지)

1. **Discover** — `flairs <sub>` + `search "<topic>" --subreddit <name> --sort top --time-filter month --limit 5`로 그 sub의 실제 컨벤션 학습
2. **Draft** — 소문자, 개인적 모먼트로 시작, marketing 형용사 금지, 한계 솔직히, 끝은 차분한 invitation. 사용자에게 보여주고 iterate
3. **Dry-run** — `post ... --dry-run`. flair 해석·바이트 수 확인
4. **Post** — **명시적 user approval** 후에만 라이브 submit (`AskUserQuestion`만으론 auto-mode classifier 통과 안 될 수 있음 → 평문 "approve" 필요)

## 핵심 함정 (해결책 내장)

- `POST_GUIDANCE_VALIDATION_FAILED` — **user-flair** (account-level) 필요. `flairs`에 안 나옴. 웹 UI에서 수동 설정
- `Our filters have designated this as spam` — opaque. user-flair → 봇 disclosure → body 30% 단축 → 몇 시간 대기 순으로 trial
- `NO_SELFS` — link-only sub (r/programming류). retry 금지
- **Shadow remove** — `reddit-post get`이 `score: 1` healthy 보여도 inbox에 automod 메시지 있음. **inbox가 source of truth**
- **Karma minimum + megathread redirect** — mod-bot이 megathread URL 안내. 본문을 거기 top-level comment로
- **Burst rate-limit** — 같은 계정 하루 3~4개 넘으면 stricter sub에서 silent filter. 며칠로 나눠 posting

## 설치 (CLI + Skill)

```bash
git clone https://github.com/cskwork/reddit-skill
cd reddit-skill
uv sync
cp .env.example .env  # REDDIT_CLIENT_ID/SECRET/USERNAME/PASSWORD 채우기

# 스킬 설치 (macOS / Linux)
mkdir -p ~/.claude/skills/reddit-poster
cp skills/reddit-poster/SKILL.md ~/.claude/skills/reddit-poster/

# 스킬 설치 (Windows PowerShell)
mkdir "$env:USERPROFILE\.claude\skills\reddit-poster"
copy skills\reddit-poster\SKILL.md "$env:USERPROFILE\.claude\skills\reddit-poster\"
```

자격증명 resolution: env vars → `.env` (cwd 위로 탐색) → `~/.claude.json` `mcpServers.reddit.env` fallback. 2FA 계정은 **app password** 발급.

## 옵션: MCP server로 쓰기

```json
{
  "reddit": {
    "type": "stdio",
    "command": "uv",
    "args": ["--directory", "/absolute/path/to/reddit-skill", "run", "reddit-mcp"],
    "env": {
      "REDDIT_CLIENT_ID": "...",
      "REDDIT_CLIENT_SECRET": "...",
      "REDDIT_USERNAME": "...",
      "REDDIT_PASSWORD": "..."
    }
  }
}
```

툴: `create_post`, `edit_post`, `delete_post`, `reply`, `list_flairs`, `get_post`, `search_reddit`. CLI와 동일 PRAW 코어.

## SKILL.md 본문 (복사용)

````markdown
---
name: reddit-poster
description: Draft and publish Reddit posts that read human (lowercase, story-first) using the cskwork/reddit-skill tools, with flair lookup, dry-run, and Reddit Responsible Builder Policy compliance.
when_to_use: User asks to "post on Reddit", "share this on r/X", "advertise on Reddit", or invokes /reddit-poster. Also when editing or deleting their own posts, or replying to a post or comment.
allowed-tools: Bash(uv *) Bash(reddit-post *) Read Write
---

Wrap the `cskwork/reddit-skill` toolkit so Claude can take a project, repo, or idea and publish a Reddit post that doesn't read like marketing copy. Drives the **`reddit-post` CLI** (primary path — works in any session regardless of MCP loading state).

Repo: https://github.com/cskwork/reddit-skill

## Verify once per session

uv --version       # 0.4+ recommended
cd <path-to-reddit-skill> && uv run reddit-post --help

If credentials missing, the CLI raises with the exact env vars to set. Resolution
order: env vars -> .env (walked up from cwd) -> ~/.claude.json
mcpServers.reddit.env fallback.

## The four-step flow

Every Reddit post follows this loop. Don't skip steps.

1. Discover — list flairs AND pull the top 5 most-upvoted recent posts on the
   relevant topic in the target sub.
2. Draft — write a human-style body that matches what you saw in step 1, show it
   to the user, iterate.
3. Dry-run — confirm flair resolution and length before going live.
4. Post — get explicit user approval, then create_post.

### Step 1 — discover

uv run reddit-post flairs <subreddit>
uv run reddit-post search "<topic keywords>" --subreddit <name> --sort top \
  --time-filter month --limit 5

Read returned title / selftext / score / num_comments. Extract title shape,
opening-line style, body length, formatting density, disclosure style. Make your
draft match that register.

### Step 2 — draft (human-style rules)

- Open with a personal moment, not a feature list
- Default to lowercase casual sentences; reserve capitals for proper nouns
- No TL;DR, no heavy bold, no emoji, no marketing adjectives
- Acknowledge limitations honestly, inline
- End with a low-key invitation ("happy to take questions")
- Code references inline with backticks; no code blocks unless non-trivial
- Title is sentence-case at minimum (immutable post-submit — triple-check)

### Step 3 — dry-run

uv run reddit-post post --subreddit <name> --title "<title>" \
  --body-file draft.md --flair "<Flair Text>" --dry-run

### Step 4 — post (explicit approval)

Show user the resolved plan. Plain-text "approve" is the safest signal — an
AskUserQuestion answer may not satisfy the auto-mode classifier for
irreversible public posting.

uv run reddit-post post --subreddit <name> --title "<title>" \
  --body-file draft.md --flair "<Flair Text>"

Verify by re-fetching:
uv run reddit-post get <url>
Confirm link_flair_text matches intent.

## Common rejection paths

- POST_GUIDANCE_VALIDATION_FAILED — user-flair (account-level on the sub) is
  required; not visible from `flairs`. User must set in web UI.
- Filters designated this as spam — opaque. Confirm user-flair first, then drop
  bot-disclosure footer to identify link-density trigger, then shorten ~30%,
  then wait.
- NO_SELFS — link-only sub (r/programming class). Do not retry.
- Karma minimum + megathread redirect — mod bot names the megathread URL; post
  body as top-level comment there via `reddit-post reply <url>`.
- Shadow / community-karma removal — inbox is source of truth, not
  `reddit-post get`. Pull unread inbox after submit; if AutoMod sent a removal
  message, treat as removed even if score is 1. Do not immediately re-submit.

## Disclosure (Responsible Builder Policy)

Bot-generated content (LLM drafted, human approved) must disclose. Default form:
*posted via my own Reddit MCP — https://github.com/cskwork/reddit-skill*

If the user asks to omit, flag the policy conflict once, then comply with the
user's call. Never silently drop disclosure.

## What not to do

- Don't cross-post identical content
- Don't manipulate votes or karma
- Don't DM users
- Don't post without explicit user approval on the live submit
- Don't paste user secrets, internal docs, or unreleased code into a public post

## Output discipline

Don't dump raw CLI output. Summarize: post URL, title, flair, score/comments
after verification. For drafts, show the rendered body in a fenced markdown
block so the user can preview formatting. For errors, show the actionable fix
not the stack trace.
````
