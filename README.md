# promptbox

AI 코딩 에이전트용 프롬프트·스킬·플러그인·MCP 설정·CLI 도구를 한 곳에 모아놓고 GitHub Pages에서 카드/사이드바 UI로 바로 복사해서 쓰는 컬렉션 사이트.

- **스택**: Astro 5 + Tailwind 3 + MDX + Content Collections
- **출력**: 정적 사이트, `dist/` → GitHub Pages
- **콘텐츠**: `src/content/{prompts,skills,plugins,harnesses,hooks,configs,mcps,tools}/*.md`

## 한 방 온보딩

첫 화면의 “개발자 추천 — 여기서 시작”은 코딩 에이전트 채팅창에 그대로 붙여넣는 설치 프롬프트다. `~/.agents/`를 단일 출처로 만들고, 설치된 Claude Code·Codex CLI·Gemini CLI·OpenCode 등에 공통 `AGENTS.md`와 `skills/`를 심링크한다.

기본 묶음에는 `handoff`가 포함된다. 작업 상태를 파일로 남겨 세션을 중단·재개하거나 다른 에이전트에게 넘길 때 쓰는 스킬이며, 설치 프롬프트는 `github.com/cskwork/handoff-skill`의 `skill/SKILL.md`를 `~/.agents/skills/handoff/SKILL.md`로 복사하도록 지시한다.

대표 포함 항목:

- 스킬: `grill-with-docs`, `improve-codebase-architecture`, `triage`, `writing-great-skills`, `ssh-llm-connect`, `call-agent`, `handoff`, `supergoal`, `superpm`, `superdesign`, `superoffice`, `superhacker`
- 도구/MCP: `rtk`, `playwright-cli`, `codebase-memory-mcp`
- 선택 도구: `supertonic-tts`, `figma-cli`

## 카테고리

| 폴더 | 용도 | 예 |
|---|---|---|
| `prompts/` | 그대로 복사해 쓰는 프롬프트 템플릿 | agents-quick-onboarding |
| `skills/` | Claude Code · Codex · Hermes용 `SKILL.md` | handoff, ssh-llm-connect |
| `plugins/` | 여러 스킬·명령을 묶은 설치 단위 | autoresearch, superpowers |
| `harnesses/` | 코딩 에이전트 자체 또는 실행 워크플로우 레이어 | oh-my-codex |
| `hooks/` | 도구 실행 전후에 개입하는 스크립트 | git-guardrails-mattpocock |
| `configs/` | `CLAUDE.md`, `AGENTS.md` 같은 에이전트 시스템 프롬프트 | agents-md |
| `mcps/` | MCP 서버 설정 스니펫 | codebase-memory-mcp |
| `tools/` | 에이전트 작업을 돕는 별도 CLI·앱 | rtk, supertonic-tts |

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:4321/promptbox
```

## 빌드

```bash
npm run build         # dist/에 정적 사이트 생성
npm run preview       # 빌드 결과 미리보기
```

기본 `site`/`base`는 환경 변수로 덮어쓸 수 있다:

```bash
SITE_URL=https://example.com BASE_PATH=/my-base npm run build
```

> **Windows + Git Bash 사용자 주의**: MSYS가 `/my-base` 같은 환경변수를 Windows 경로로 변환해 링크가 `/C:/Program Files/Git/my-base/`로 깨진다. 다음 둘 중 하나로 해결:
> ```bash
> MSYS_NO_PATHCONV=1 BASE_PATH=/promptbox npm run build
> # 또는 PowerShell 사용
> $env:BASE_PATH = "/promptbox"; npm run build
> ```
> GitHub Actions(Linux)에서는 이 문제가 없다.

## 항목 추가하는 법

1. 해당 카테고리 폴더에 `.md` 또는 `.mdx` 파일 추가
2. frontmatter는 `src/content/config.ts` 스키마를 따른다:

```yaml
---
title: 항목 제목
summary: 한 줄 요약 (카드/메타 설명에 노출)
tags: [tag1, tag2]
source: https://github.com/...     # 선택: 원본 링크
author: cskwork                    # 선택
license: MIT                       # 선택
order: 10                          # 정렬 우선순위 (낮을수록 위)
# 카테고리별 확장 필드
trigger: "..."                     # skills 전용
install: "..."                     # skills 전용
harnesses: [Claude Code]           # plugins 전용
event: "PreToolUse"                # hooks 전용
server_name: "..."                 # mcps 전용
transport: stdio                   # mcps 전용
platforms: [macOS, Linux]          # harnesses/tools 전용
target_file: "..."                 # configs 전용
tools: [Claude Code]               # configs 전용
use_case: "..."                    # prompts 전용
---
```

3. 본문에는 큐레이션된 설명 + ```` ``` ```` 코드블록으로 복사용 원문을 함께 둔다. 상세 페이지의 "원문 복사" 버튼은 frontmatter를 제외한 본문 전체(`entry.body`)를 클립보드에 복사한다.

## GitHub Pages 배포

`.github/workflows/deploy.yml`이 `main` 푸시마다 자동으로:

1. Node 22 + `npm ci`
2. 저장소 이름을 기준으로 `base`/`site` 자동 계산
   - `<owner>/<owner>.github.io` 형태 → `base=/`
   - 그 외 → `base=/<repo-name>`
3. `npm run build`
4. `dist/`를 Pages 아티팩트로 업로드 → `deploy-pages@v4`로 게시

리포지토리 Settings → Pages → Source를 **GitHub Actions**로 설정해야 첫 빌드가 게시된다.

## 디렉토리 구조

```
src/
├── content/
│   ├── config.ts                # Content Collections 스키마
│   ├── prompts/*.md
│   ├── skills/*.md
│   ├── plugins/*.md
│   ├── harnesses/*.md
│   ├── hooks/*.md
│   ├── configs/*.md
│   ├── mcps/*.md
│   └── tools/*.md
├── components/
│   ├── Header.astro             # 상단 nav + 테마 토글
│   ├── Sidebar.astro            # 좌측 카테고리 네비 + 검색
│   └── CopyButton.astro
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro              # 카드 그리드 홈
│   ├── [category]/[...slug].astro  # 상세 페이지
│   └── 404.astro
└── styles/
    └── global.css               # Tailwind + 커스텀 prose
```

## 라이선스

각 콘텐츠 항목의 라이선스는 frontmatter `license` 필드 또는 `source` 링크를 따른다. 사이트 셸 코드 자체는 MIT.
