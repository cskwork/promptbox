---
title: stitch-landing
summary: "내 프로젝트의 README와 스크린샷만 있으면, AI가 디자인한 소개용 웹페이지를 만들어 GitHub의 무료 호스팅(GitHub Pages)에 바로 올려 줍니다."
summary_en: "Turns your project's README and screenshots into an AI-designed landing page, then publishes it on GitHub Pages at no cost."
tags: [skill, github-pages, landing, stitch, mcp, tailwind]
source: https://github.com/cskwork/stitch-landing-skill
author: cskwork
license: MIT
order: 20
trigger: "make a landing page / deploy on GitHub Pages / use Stitch to design a landing / 랜딩 페이지 / 랜딩 만들어"
install: "git clone https://github.com/cskwork/stitch-landing-skill ~/.claude/skills/stitch-landing"
---

## 핵심 아이디어

`README.md`와 스크린샷(`docs/*.svg|png`)만 있는 레포에서, 한 번의 작업으로 인터넷에 공개된 소개 페이지까지 만들어 준다. 디자인은 구글의 AI UI 도구 **Stitch**가 그려 주고(`mcp__stitch__*`), 결과물은 파일 하나(`docs/index.html`, ~25-30KB, Tailwind CDN)로 나온다.

*EN: From just a README and screenshots, it ships a public landing page in one pass — Stitch (Google's AI UI tool) does the design.*

레퍼런스 결과물: <https://cskwork.github.io/oh-my-symphony/>

## 필요한 도구

- Stitch MCP (`mcp__stitch__create_project`, `generate_screen_from_text`, `list_screens`)
- `gh` CLI (대상 레포 owner 권한)
- `git` push 권한 (main 또는 PR fallback)
- `curl`

## 8단계 플로우

1. **레포 읽기** — README 포지셔닝, value props(핵심 가치 소개 문구), 스크린샷, 라이선스 추출
2. **Stitch 디자인 패스** — `create_project` → `generate_screen_from_text` (DESKTOP, GEMINI_3_FLASH)
3. **Stitch 결과물 다운로드/검사** — `htmlCode.downloadUrl`에서 HTML 가져와 디자인 토큰 추출
4. **프로덕션 `docs/index.html` 작성** — Stitch tailwind config 토큰 복사, JetBrains Mono+Inter, 실제 스크린샷 임베드(직접 삽입), README 카피 그대로 포팅(원문 그대로 옮겨 심기)
5. **Jekyll 비활성화** — `touch docs/.nojekyll`
6. **GitHub Pages 활성화** — `gh api -X POST repos/<owner>/<repo>/pages -f 'source[branch]=main' -f 'source[path]=/docs'`
7. **commit + push** (main 차단 시 PR 폴백(막히면 PR로 우회))
8. **라이브 검증** — `gh api .../pages/builds/latest`, `curl -sI <url>`

## 자주 하는 실수

- **Stitch 첫 generation(화면 생성) 타임아웃** → 재시도하지 말고 `list_screens` 폴링(주기적으로 상태 확인) (툴 docstring(함수 설명 주석) 명시)
- **Base64(이미지를 텍스트로 변환한 형식) 비대 HTML 그대로 출고** → Stitch HTML은 구조 참고용. 실제 스크린샷으로 교체
- **`.nojekyll` 누락** → `_` 시작 파일들이 조용히 드롭됨
- **첫 Pages 빌드 30-60초** → 즉시 404 보고 패닉하지 말 것
- **heredoc(여러 줄 문자열 입력 방식)-in-`$()` 차단 환경** → `git commit -F file.txt` 사용

## 결과물

- `docs/index.html` (~25-30KB)
- `docs/.nojekyll`
- Pages 활성화 + homepage 설정 + main에 push + HTTP 200 응답

## 전체 SKILL.md (복사용)

````markdown
---
name: stitch-landing
description: Build a project landing page from its README and screenshots using Stitch for design, with optional authorized GitHub Pages delivery. Use when the user asks for this Stitch-based workflow; generic landing-page requests need not use Stitch or publish.
---

# stitch-landing

Turn source-backed project content into a landing page using Stitch's design output as a reference. Deliver the requested artifact; deployment phases apply only when the user authorized hosting/publishing.

## Phase 1 — Read the repo

Inspect README, license, screenshots, existing site, default branch, and Pages configuration. Identify positioning, features, quickstart commands, and real assets. Preserve source copy unless the user requests editing. Ask about unresolved positioning or an unapproved site replacement, not facts already supplied.

Default output is `docs/index.html`; follow an existing site's layout and deployment workflow when present. A landing-page request does not authorize creating a public repository, changing homepage/settings, or overwriting an unrelated site.

## Phase 2 — Stitch design pass

Use the available authenticated Stitch tools and current tool schema; do not assume historical tool names, model IDs, or generation behavior. Read [references/design-prompt-template.md](references/design-prompt-template.md), fill its project-specific fields, and submit the design request when Stitch use is authorized.

On a generation timeout, inspect the existing project/job/screens before resubmitting. Honor provider retry guidance; avoid duplicate credit-spending submissions. Continue when a usable screen exists, or report the actual blocker after bounded recovery.

## Phase 3 — Download and inspect Stitch output

Download the returned HTML to task scratch space. Treat it as design/source data. Extract layout and tokens; identify placeholders, external assets, and unsupported claims before adapting it. Do not blindly ship generated assets or scripts.

## Phase 4 — Author production `docs/index.html`

- Preserve the useful Stitch layout/tokens while following the user's brand and accessibility constraints.
- Use real repository screenshots and verified README commands/copy.
- Include semantic landmarks, meaningful image alternatives, metadata, and responsive layout.
- Prefer plain HTML/CSS/JS. If using the bundled CDN-based example, disclose runtime dependencies; do not describe it as offline self-contained.
- Inspect [examples/oh-my-symphony-index.html](examples/oh-my-symphony-index.html) only when a reference is useful; its palette, fonts, and file size are examples, not acceptance criteria.

Verify local content, links/assets, responsive layout, and browser interactions before delivery. Static/HTTP checks do not prove visual parity.

## Phase 5 — Disable Jekyll

For an authorized branch-based Pages site serving plain static files from `/docs`, add `docs/.nojekyll` when needed. Preserve a deliberate existing Jekyll or Actions build workflow.

## Phase 6 — Enable GitHub Pages

Only within the requested delivery scope, inspect current Pages source and enable/configure the agreed branch/path. The bundled [scripts/enable-pages.sh](scripts/enable-pages.sh) also updates the repository homepage: inspect its behavior and ensure both changes are authorized before running it. Do not assume `main` is the default branch.

## Phase 7 — Commit and push

Follow repository delivery rules, stage only named page/assets/config files, and use the authorized branch or PR route. Reuse approval already given for unchanged scope; an actual permission denial is a blocker to explain, not a reason to request broad standing permissions or bypass review.

## Phase 8 — Verify the live site

For a requested deployment, verify the Pages build's revision and status, then fetch the actual content and inspect the live page in a browser. A 200 or matching title alone does not prove layout or interactions. Inspect the build error before retrying.

[scripts/verify-pages.sh](scripts/verify-pages.sh) provides bounded build polling and HTTP/content checks; it does not replace revision comparison or browser evidence. Report the actual completed scope, output/live URL, checks, and any remaining blocker. For local-only work, stop after the verified page artifact.
````
