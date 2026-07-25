---
title: ego (lite) + ego-browser
summary: "사람과 AI 에이전트가 같이 쓰는 Chromium 브라우저. 내 로그인·쿠키·확장을 그대로 물려받은 채, 에이전트는 별도 작업 공간(Task Space)에서 탭을 열고 폼을 채우고 스크린샷을 찍는다. 함께 딸려오는 ego-browser 스킬이 JS 한 덩어리로 여러 동작을 묶어 실행해 Playwright식 셀렉터 자동화보다 왕복이 적다. 현재 macOS 전용, 무료."
summary_en: "A Chromium browser you and your agent share. It inherits your real logins and cookies, gives the agent its own Task Space so it never steals your tabs, and ships an ego-browser skill that batches many steps into one JS snippet instead of one tool call per click."
tags: [browser, agent-browser, web-automation, qa, chromium, macos, skill]
source: https://lite.ego.app/
author: Citro Labs
license: MIT (스킬 레포 기준 · 브라우저 앱은 별도 무료 배포)
languages: [JavaScript, TypeScript]
platforms: [macOS]
order: 12
install: "npx skills add citrolabs/ego-lite"
---

## 한 줄

"에이전트 전용 브라우저를 새로 띄우는" 방식(Playwright·Puppeteer·Browser Use)을 버리고, **내가 매일 쓰는 브라우저를 에이전트와 나눠 쓰는** 쪽으로 뒤집은 도구. 로그인 상태를 이미 갖고 있으니 캡차·2FA·SSO 재인증 루프를 피한다.

## 언제 쓰는가

- 로그인이 필요한 웹앱을 에이전트가 대신 조작해야 할 때 (관리자 페이지, 사내 툴, SaaS 대시보드)
- 웹 QA(품질 점검)·탐색적 테스트를 시키는데, Playwright의 CSS 셀렉터(요소를 찾는 주소 문자열)가 DOM 바뀔 때마다 깨져서 지친 경우
- 페이지 데이터 추출, 폼 자동 입력, 스크린샷 캡처를 에이전트에게 맡기고 싶을 때
- 에이전트가 브라우저를 점거해서 내 탭을 못 쓰는 상황을 피하고 싶을 때

## 무엇을 하는가

| 개념 | 내용 |
|---|---|
| Task Space | 에이전트 전용 작업 공간. 내 탭과 분리되고, 제어권은 **한쪽만** 갖는다(에이전트 ↔ 사용자 handoff) |
| Semantic snapshot | CSS 셀렉터 대신 `@N` 참조로 요소를 지목. 크로스 오리진 iframe·shadow DOM·서드파티 위젯까지 Chromium 엔진 레벨에서 잡는다 |
| JS 배치 실행 | `ego-browser nodejs <<'EOF' … EOF` 힙독 한 번에 여러 동작을 담아 왕복 횟수·토큰을 줄인다 |
| Chrome 이관 | 탭·북마크·비밀번호·확장·쿠키/세션·프로필을 1클릭 가져오기 |
| 로컬 보관 | 브라우징 데이터를 업로드하지 않는다고 명시 |

에이전트가 쓰는 헬퍼: `snapshotText` · `click` · `fillInput` · `typeText` · `gotoAndWait` · `captureScreenshot` · `waitForElement` · `serverFetch` · `useOrCreateTaskSpace` 등.

지원 에이전트: Claude Code · Codex · Cursor · Gemini CLI · OpenCode · Kiro · Hermes 등 셸 명령을 실행할 수 있는 모든 CLI. SDK 연동·모델 종속 없음.

## 설치 (macOS)

```text
# 1) 스킬만 설치 — 첫 브라우저 작업 때 에이전트가 앱 설치를 안내한다
npx skills add citrolabs/ego-lite

# 2) 또는 앱을 먼저 설치 (앱 설치 시 ego-browser 스킬이 모든 에이전트 스킬 폴더에 자동 등록)
#    https://lite.ego.app/ 에서 DMG 다운로드 → /Applications 설치 → 첫 실행 온보딩

# 3) 또는 에이전트에게 통째로 위임 — 아래를 그대로 붙여넣기
Set up ego lite for me: https://github.com/citrolabs/ego-lite

Read `skills/ego-browser/references/install.md` and follow the steps to install ego lite.
```

설치 확인:

```bash
command -v ego-browser        # 없으면 export PATH="$HOME/.local/bin:$PATH"
ego-browser nodejs <<'EOF'
cliLog('ego-browser ready')
EOF
```

에이전트 안에서는 `/ego-browser` 로 호출한다.

## 함정

- **macOS 전용.** Windows·Linux는 로드맵 단계다. 크로스 플랫폼 CI에서 돌릴 헤드리스 자동화 대체제가 아니다.
- **첫 실행 온보딩은 GUI에서 사람이 해야 한다.** 앱 온보딩이 끝나야 `ego-browser` 명령이 `~/.local/bin`에 등록된다. 에이전트가 헤드리스로 끝낼 수 없는 구간이라, 설치 스크립트는 앱을 띄운 뒤 사람의 완료 확인을 기다려야 한다.
- **PATH 함정**: 온보딩을 마쳤는데 `command not found`가 나면 대개 `~/.local/bin`이 PATH에 없는 것이다.
- **제어권 충돌**: "user is controlling" 오류는 재시도 대상이 아니라 하드 스톱이다. 사용자가 GUI에서 언제든 제어권을 가져갈 수 있고, 이때 에이전트는 자동 탈취(takeover)하면 안 된다.
- **내 로그인 세션을 그대로 쓴다**는 건 편의이자 위험이다. 에이전트가 실제 계정으로 결제·발송·삭제까지 할 수 있으므로, 되돌리기 어려운 동작은 Task Space를 분리하고 사람 확인을 끼워라.
- **성능 수치(agent-browser 대비 2.5~3.45배 빠름)는 벤더 자체 측정**이다. 검증되지 않았다.
