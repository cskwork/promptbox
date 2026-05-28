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
description: Turn any project README into a deployed GitHub Pages landing page via Stitch MCP. Use when the user asks to "make a landing page", "deploy on GitHub Pages", "use Stitch to design a landing", or wants a hosted marketing/preview page generated from existing repo context. Triggers — "landing page", "github pages", "stitch landing", "ship a landing", "랜딩 페이지", "랜딩 만들어", "stitch로 디자인".
---

# stitch-landing

End-to-end skill that takes a project (README + screenshots) and ships a deployed landing page on GitHub Pages, using Stitch MCP for the design pass and Tailwind CDN for the production output.

## When to use

- User has a repo with a README and asks for a landing page hosted on GitHub Pages.
- User says "use Stitch to design", or wants a marketing/preview page they can share.
- Project already has screenshots, badges, or feature copy in the README that should be reused (don't rewrite copy — port it).

## When NOT to use

- The project already has a Pages site you'd be overwriting — confirm first.
- The user wants a multi-page docs site (use Docusaurus / MkDocs / Astro instead).
- The repo has no README and no clear positioning — run discovery first.

## Required tools

- **Stitch MCP** — `mcp__stitch__create_project`, `mcp__stitch__generate_screen_from_text`, `mcp__stitch__list_screens`
- **gh CLI** — authenticated for the target repo's owner
- **git** — push access to default branch (or PR fallback)
- **curl** — verify the live URL

## The flow (8 phases)

### Phase 1 — Read the repo
Read `README.md`, `LICENSE`, screenshots in `docs/`, and any existing `index.html`. Extract positioning, value props, quickstart, visual assets, license + homepage.

### Phase 2 — Stitch design pass
mcp__stitch__create_project → mcp__stitch__generate_screen_from_text { deviceType: DESKTOP, modelId: GEMINI_3_FLASH, prompt: ... }. Generation takes 1–3 min. DO NOT retry on timeout. Poll list_screens every 60s. If no screen after ~3 min, retry once with shorter prompt.

### Phase 3 — Download and inspect Stitch output
curl -sSL -o stitch-screen.html "<htmlCode.downloadUrl>". Don't ship verbatim — base64 inline assets bloat the file. Use as structural reference + token source.

### Phase 4 — Author production docs/index.html
1. Reuse Stitch's tailwind.config tokens verbatim
2. Load JetBrains Mono + Inter via Google Fonts
3. Embed real repo screenshot, not Stitch placeholder
4. Port README copy verbatim
5. Semantic landmarks + og:image + meta description + theme-color
6. No JS framework. Tailwind CDN + ~50 lines inline <style>

### Phase 5 — Disable Jekyll
touch docs/.nojekyll

### Phase 6 — Enable GitHub Pages
gh api -X POST repos/<owner>/<repo>/pages -f 'source[branch]=main' -f 'source[path]=/docs'
gh api -X PATCH repos/<owner>/<repo> -f homepage='https://<owner>.github.io/<repo>/'

### Phase 7 — Commit and push
Standard git commit + push. If main blocked by auto-mode classifier, ask via AskUserQuestion: (a) push to main, (b) feature branch + PR, (c) stop.

### Phase 8 — Verify the live site
sleep 30 (let Pages build)
gh api repos/<owner>/<repo>/pages/builds/latest --jq '{status, commit, error}'
curl -sI https://<owner>.github.io/<repo>/
curl -s  https://<owner>.github.io/<repo>/ | grep -E '(<title>|<your tagline>)'

## Deliverables
- docs/index.html (~25-30K)
- docs/.nojekyll
- Pages enabled, homepage set, commit pushed, HTTP 200
````
