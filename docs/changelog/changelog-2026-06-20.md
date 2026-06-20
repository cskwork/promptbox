# 2026-06-20 — UI/UX 표적 개선 (web + mobile)

`/superdesign` REDESIGN(Preserve 서브모드) + ultracode 멀티 에이전트 감사로 진행. 브랜드(emerald
accent, glassmorphism, 카테고리 hue, 다크모드)는 유지하고 표적 결함만 수술적으로 고침. 4개 렌즈
(mobile / desktop / a11y / taste) 병렬 감사 + 적대적 검증으로 13개 결함을 확정한 뒤 적용.

## 변경 (왜)

### 모바일 터치 타깃 (44px 미만 → 보완)
- `Sidebar`: 검색 입력 `py-1.5 → py-2.5 lg:py-1.5`, 카탈로그/홈 링크 `py-1.5 → py-2 lg:py-1.5`.
  데스크톱 밀도는 그대로, 모바일만 40~44px 확보. 50+ 항목 목록에서 오탭 감소.
- `Footer`: 네비 링크에 `inline-block py-1.5`. 텍스트 전용 ~20px 타깃을 ~40px로.
- `Header`: GitHub·테마 토글 `h-8 w-8 → h-9 w-9 lg:h-8 lg:w-8`, 간격 `gap-1 → gap-1.5` (모바일).
  56px 헤더 안에서 32px 두 버튼이 4px 간격으로 붙어 생기던 오탭(라이트/다크 잘못 토글) 완화.

### 모바일 검색 도달성 (a11y)
- `Sidebar`: "/" 단축키가 접힌 모바일 패널에서 무반응이던 문제 수정 — `input.focus()` 전에
  `navBody`가 `hidden`이면 토글을 먼저 열도록. kbd 힌트가 약속한 동작을 실제로 수행.

### 한국어 타이포 (taste — 가장 가시적인 결함)
- `global.css`: `html[lang='ko'] body { word-break: keep-all; overflow-wrap: break-word; }` 추가.
  한국어는 어절 내 공백이 없어 브라우저가 어절 중간에서 줄을 끊어 ragged하게 보였음. keep-all로
  어절 경계 줄바꿈, overflow-wrap으로 긴 라틴/URL 토큰 overflow 방지. 기존 `text-balance/pretty`도
  이 변경 후에야 제대로 동작.

### 대비 (WCAG AA)
- `text-ink-400`(#7d869a, 흰 배경 ~3.4–3.65:1, AA 미달) 중 정보성 텍스트(EN 캡션·카운트·라벨·
  empty/no-result 상태·검색 placeholder)를 `text-ink-500 dark:text-ink-400`로. 라이트모드만
  #525c70(~6.3:1, AA 통과)로 올리고 다크모드는 유지(ink-400 on dark ~5.4:1 이미 통과).
  장식용 SVG stroke와 다크 터미널 위 텍스트는 그대로(이미 통과).

### 데스크톱 스캔성
- `index`: 카테고리 섹션 헤더에 `border-b ... pb-2` 추가. skills 34개 vs 다른 카테고리 1~3개로
  긴 스크롤 시 경계가 모호하던 문제 → 각 섹션이 구분된 밴드로 읽힘.
- `index`: 카탈로그 그리드 `gap-3 → gap-4 sm:gap-5`. 거터(12px)가 카드 패딩(16px)보다 좁아
  hover lift 그림자가 이웃을 침범하던 리듬 깨짐 해소.
- `Hero`: 2단 그리드 `items-center → lg:items-start`. 짧은 터미널이 긴 텍스트 컬럼 중앙에 떠서
  생기던 상하 빈 공간 제거, 데모가 헤드라인에 정렬.
- `Hero`: 터미널 긴 경로 줄(`~/.claude/skills/diagnose/SKILL.md`)에 `break-all`. 320px급 기기에서
  카드 내 가로 스크롤 유발하던 unbreakable 토큰 처리.

### 스크린리더
- `[...slug]`: prev/next의 `←`/`→`를 `<span aria-hidden="true">`로 감쌈. "left-arrow 이전 Prev"
  노이즈 제거.

### 가시 본문 em-dash → 사이트 컨벤션(`·`/`:`)
- `Hero` 터미널 4곳, `HowItWorks` 안내문 3곳, `404` 본문 2곳의 em-dash를 가운뎃점/콜론으로.
  사이트가 이미 전역에서 `·`를 구분자로 쓰므로 일관성↑, anti-slop em-dash 기준에도 부합.

## 의도적으로 보존 (REDESIGN: copy voice / 디자인 시스템 유지)
- 카테고리 wayfinding hue의 violet/indigo hex(`#8b5cf6`, `#6366f1`, `#a78bfa`, `#818cf8`)는
  anti-slop 게이트가 "AI-purple"로 오탐 → 의도된 8색 길찾기 시스템이며 브랜드 accent(emerald)와
  분리됨. 해당 4줄에 `taste-ok` 주석으로 정당화(게이트의 공식 escape hatch).
- 페이지 `<title>`·코드 주석·`aria-label`의 em-dash, glassmorphism 머티리얼의 저알파
  `rgba(255,255,255,…)` 하이라이트/틴트 그림자: 게이트가 플래그하나 의도된 브랜드 보이스/머티리얼.
  비가시 또는 디자인 시스템 핵심이라 보존(불필요한 대량 taste-ok 노이즈 회피).

## 검증
- `astro build` green (54 페이지) — 프로젝트의 권위 있는 검증.
- anti-slop 게이트: 변경으로 위반 22 → 16 감소(가시 em-dash 9 제거, purple 4 정당화). 남은 16은
  전부 위 "보존" 항목(사전 존재 의도 패턴). 신규 위반 0. ai-purple/Inter/bounce/scroll-listener/
  placeholder-name/filler-verb 등 실질 슬롭 신호는 전부 clean.
- 대비는 토큰 스왑으로 AA 충족(라이트 #525c70 ≈ 6.3:1).

---

## 2차 라운드 — ultracode 향상 제안 (propose → judge → 적용)

5개 디자이너 에이전트가 a11y 기본 수정을 넘어선 향상안을 제시 → 각 안을 3명 심사 패널이
가치·브랜드 적합도·회귀 위험으로 평가(20 에이전트). 합의 SHIP만 적용.

### 적용 (SHIP, 3건)
- `global.css` **카드 focus-within 패리티**: `.glass-card:hover`에 `:focus-within` 추가.
  키보드 사용자가 카드 탭 시 마우스 hover와 동일한 lift + 카테고리 보더 단서를 받음(이전엔 내부
  링크 포커스 링만). 만장일치 SHIP. 기존 transition 리스트 재사용 → transform/opacity 외 무애니.
- `global.css` **카탈로그 카드 상단 2px 카테고리 hue 엣지**: rest 시 카테고리를 한눈에. 기존 `--cat`
  변수 사용(emerald accent 불간섭), hover/focus 시 opacity만 0.4→0.8. `.glass-card[class*='cat-']`
  스코프라 cat- 없는 prev/next 카드는 제외. 심사 정제판 반영(isolation 블록·재채도 제거).
- `Sidebar.astro` **모바일 카테고리 퀵점프 칩 행**: 펼친 모바일 nav 상단에 스와이프 가능한 hue
  칩 행. 기존 `grouped`/`cat-*`/`CategoryIcon`/카운트 재사용, 네이티브 앵커 스크롤(스크롤 리스너 없음),
  `lg:hidden`. HOLD 판정이 지적한 블로커 보정 반영: 칩에 `min-h-[2.5rem]`(터치 타깃), 한글 라벨
  `font-sans`(`.cat-chip`의 mono 상속 회피). 칩 클릭 시 활성 검색 필터를 비워 타깃 그룹 가시화.

### 보류 (HOLD, 2건 — 합의 미달, 블로커 존재)
- 상세 페이지 sticky "원문 복사" 헤더: 제안의 `lg:top-4 lg:z-20`가 z-40 sticky Header(56px) 아래로
  파고드는 오버랩 버그 + 전체 헤더(~300px)를 고정하면 독서 영역 과점. 슬림 액션 바 + `lg:top-20`로
  재설계 시 적용 가능.
- 라이브 검색 결과 카운트: 로직은 안전하나 "N matches" 영문 단독이 사이트의 KO-우선 이중 표기를
  깨고, `aria-live`가 키 입력마다 떠듦. 이중 표기(`N개 일치 · N matches`) + aria-live 디바운스/제거 시
  적용 가능.

### 검증 (2차)
- `astro build` green(54 페이지). anti-slop 게이트: 3개 SHIP가 추가한 신규 위반 0(Sidebar 위반 0,
  global.css는 사전 존재 주석 em-dash·glass rgba만). 실질 슬롭 신호 전부 clean.

---

## 3차 — 웹 성능 (폰트 self-host)

측정 결과 사이트는 이미 가볍다(CSS gz 7.7KB, JS 전부 인라인·외부 번들 0, index.html gz 39KB).
유일한 실질 병목은 **렌더 블로킹 Google Fonts**: `<head>`의 `fonts.googleapis.com` 스타일시트가
첫 페인트를 막고, 외부 origin 2곳(googleapis·gstatic)에 DNS/TLS 핸드셰이크를 강제.

### 변경 (왜)
- **폰트 self-host**: Geist·JetBrains Mono의 **라틴 normal variable woff2 2개만**(29KB + 40KB)
  `public/fonts/`에 두고, `BaseLayout` head에 base-safe 인라인 `@font-face`(`font-display: swap`)
  + 두 폰트 `preload`로 연결. Google Fonts `<link>` + preconnect 2개 제거.
  - 효과: third-party 렌더 블로킹 요청 제거, 외부 핸드셰이크 0, FOUT 제거(폰트 same-origin),
    above-the-fold 폰트 preload로 swap 구간 단축. 한글은 변동 없이 시스템 폰트 폴백.
  - `@fontsource-variable/*`는 woff2 추출용으로만 잠시 설치 후 제거(런타임/빌드 의존성 없음).
  - latin subset만 골라 cyrillic/greek 등 미사용 글리프 번들 회피(전 subset 대비 woff2 수 최소화).
- `tailwind.config`: `fontFamily.sans/mono` 선두에 `Geist Variable`/`JetBrains Mono Variable` 추가
  (기존 이름은 폴백으로 유지). italic은 기존과 동일하게 faux(원래 Google 로드도 normal weight만).

### 검증 (3차)
- `astro build` green(54 페이지). `grep googleapis/gstatic dist/` → 0건(외부 폰트 요청 완전 제거).
- `dist/fonts/`에 woff2 2개 포함, `index.html`에 두 preload + 인라인 @font-face 확인.

### 적용하지 않음 (선택지로 남김)
- `body { background-attachment: fixed }`(앰비언트 글로우): 모바일 스크롤 repaint 비용이 있으나,
  fixed 의사요소 레이어로 바꾸면 스태킹 컨텍스트 회귀 위험 + 브랜드 글로우 시각 검증을 브라우저
  없이 못 해 보류. 원하면 적용 가능.
- `public/og.png` 2400×1260·405KB: 스펙(1200×630)의 2배. 크롤러 전용이라 사용자 페이지 로드와는
  무관하지만, 절반 리사이즈 시 소셜 카드 로드·저장소 용량 개선. 별건으로 처리 가능.

---

## 4차 — 개발자 추천 온보딩 섹션 + 한 방 설치 프롬프트

요청: 랜딩에 "개발자 추천" 온보딩 섹션 추가 + 추천 항목 한 묶음을 **단일 복사-붙여넣기 프롬프트**로
한 번에 설치(있으면 최신화)하게 함. 추천 항목 9종은 모두 이미 카탈로그에 존재 → 신규 작성은
설치 프롬프트(시스템 프롬프트 통합 `.agents/` 개념) 1건뿐.

### 변경 (왜)
- `src/data/onboarding.ts` (신규): 큐레이션 목록(`ONBOARDING_PICKS`) + 설치 프롬프트
  (`INSTALL_PROMPT`)의 **단일 출처**. 컴포넌트가 이 모듈만 읽어 카드 그리드와 복사 블록을 그림.
  픽이 누락되면 빌드를 깨지 않고 그리드가 줄어들게(`find` → skip) 설계.
- `src/components/DeveloperPicks.astro` (신규): glass-panel 섹션. 상단에 다크 코드블록으로 설치
  프롬프트(복사 대상 `<pre id="onboard-prompt">`, 기존 `.pc-copy` 메커니즘 재사용) + "하는 일" 3칸
  + 기존 `Card`로 큐레이션 9종 렌더. `HowItWorks`와 `catalog` 사이에 배치.
- `src/content/prompts/agents-quick-onboarding.md` (신규): 설치 프롬프트의 카탈로그 엔트리(상세
  페이지·원문 복사). 본문은 KO 설명 4절 + 검증용 ```text 페이로드. 페이로드는 `INSTALL_PROMPT`와
  동일(원소스 라운드트립 컨벤션). `source` 미기재(원본 없음, 날조 금지 규칙).
- `src/pages/index.astro`: `<DeveloperPicks />` 1줄 삽입 + import.

### 결정/대안
- 신규 카테고리 추가 아님(기존 `prompts` 컬렉션에 엔트리 1건) → config.ts·COLLECTIONS 3파일
  동기화 불필요(불필요한 광범위 변경 회피).
- 설치 프롬프트 텍스트가 `.ts`와 `.md` 두 곳에 중복: 콘텐츠 마크다운은 TS를 import할 수 없어
  불가피. 안정 텍스트라 비용 한정, 양쪽에 동기화 주석.
- 프롬프트는 백틱 없는 평문으로 작성(템플릿 리터럴 이스케이프 지옥 회피, 에이전트 paste용으로 충분).
- `~/.agents/` 단일 출처 → 설치된 CLI에 심링크 방식은 사용자가 명시한 설계. 기존 repo CLAUDE.md의
  "Global install" 패턴을 스킬+시스템프롬프트 통합으로 일반화.

### 검증
- `npm run build` green(55 페이지, +1). `dist/prompts/agents-quick-onboarding/` 생성 확인,
  `dist/index.html`에 섹션 제목 + 설치 프롬프트 본문 임베드 확인(복사 버튼 동작 대상).

### 후속 — 크로스플랫폼 보강
- 설치 프롬프트의 OS 분기 강화: `~`를 현재 OS 홈으로 해석, Windows에서 심링크 권한이 없으면
  폴더→정션(junction)·파일→하드링크(hardlink)로 자동 폴백(둘 다 권한 불필요), 최후엔 복사 +
  "자동 업데이트 안 됨" 고지. macOS/Linux는 `ln -s`. `.ts`/`.md` 동기 수정.

### 후속 2 — 추천 항목 7종 추가 (picks 9 → 16)
- 신규 카탈로그 엔트리 6건(병렬 executor 서브에이전트가 각 소스 클론·작성, gold 템플릿=supergoal.md):
  `skills/superdesign` · `skills/superoffice` · `skills/superhacker` · `skills/superpm`(모두 cskwork
  super* 멀티파일 스킬, 전체 repo clone+symlink 필요), `skills/figma-cli`(silships/figma-cli —
  SKILL.md 없어 직접 작성; bin 별칭 `figma-cli`·서브커맨드 전부 REFERENCE.md와 대조 검증),
  `tools/supertonic-tts`(사용자 지정 "just cli" → tools 카테고리, npm 전역 설치).
- 기존 `skills/supergoal`은 소스 일치 확인 후 picks에만 추가(중복 생성 안 함).
- `onboarding.ts`: ONBOARDING_PICKS 16종으로 확장(테마별 정렬) + INSTALL_PROMPT에 super* 멀티파일
  스킬 블록·CLI 도구 블록(supertonic-tts·figma-ds-cli) 추가. 동일 페이로드를 `.md`에 동기.
- superhacker는 보안 스킬이라 "서면 승인 게이트·최소 영향·CTF/학습/승인된 테스트 한정"으로
  책임 있게 기술(공격 역량 과장 금지).
- 검증: `npm run build` green(61 페이지, +6). 신규 상세 6쪽 생성, 홈 "What's in the kit · 16 items",
  신규 픽 7종 카드 렌더, 설치 프롬프트에 supergoal-skill 소스 임베드 확인.

---

## 5차 — 랜딩 성능 최적화 (off-screen 카드 렌더 스킵)

측정 우선: `index.html` 324KB raw / **51KB gz**(3차 39KB → picks 16종 + 신규 카탈로그로 증가),
홈에 카드 article **75개** + 인라인 SVG **196개**, CSS 7.8KB gz. 전송량은 양호 —
실질 병목은 **긴 단일 스크롤에서 화면 밖 ~60개 카드의 레이아웃/페인트**.

### 변경 (왜)
- `global.css` `.glass-card`에 `content-visibility: auto` + `contain-intrinsic-size: auto 200px`.
  브라우저가 뷰포트 근처가 아닌 카드의 레이아웃/페인트를 미룸. intrinsic-size로 스크롤바·앵커
  안정, `auto`가 첫 페인트 후 실측 크기 캐시. 미지원 브라우저는 no-op(graceful). reveal
  IntersectionObserver는 섹션만 관찰하므로 카드 cascade 애니메이션과 무충돌.
- 적용 안 함(ROI 낮음): CSS 인라인화(7.8KB gz 차단은 미미), SVG 스프라이트 dedup(gzip이 이미
  반복 마크업 압축; DOM 노드 감소 효과는 content-visibility가 더 직접적으로 해결), og.png(크롤러 전용).

## 6차 — 전역 설정 경로 교정 (설치 프롬프트 매핑)

사용자 지적(Gemini 기본 파일·Antigravity 차이·Kilo 누락)을 현재(2026) 문서로 검증 후 수정:
- **Gemini CLI**: `~/.gemini/AGENTS.md` → `~/.gemini/GEMINI.md`(기본). AGENTS.md 이름은
  `~/.gemini/settings.json`의 `context.fileName`에 추가해야 인식. 전역 skills 폴더 없음.
- **Antigravity**: `~/.antigravity/AGENTS.md`(틀림) → `~/.gemini/GEMINI.md` 공유(알려진 충돌),
  워크스페이스 규칙은 `.agents/rules/` + AGENTS.md(v1.20.3+).
- **Codex skills**: "(if supported)" 제거 — `~/.codex/skills/` 정식 지원 확인.
- **Cursor**: 전역 파일 없음, 레포 루트 `AGENTS.md` 네이티브 지원(+`.cursor/rules/` 스코프).
- **Windsurf**: 전역 `~/.windsurf/rules/` 또는 레포 `AGENTS.md`(루트 always-on).
- **Kilo Code**: 신규 추가 — AGENTS.md 우선 로드 후 `.kilocode/rules/`, 전역은 글로벌 config 폴더 AGENTS.md.
- 심링크는 링크 이름만 도구별로 다르고(CLAUDE.md/AGENTS.md/GEMINI.md) 타깃은 단일 `~/.agents/AGENTS.md` —
  이 점을 프롬프트에 명시. `.ts`/`.md` 동기 + KO 함정 절에 Gemini/Antigravity/Cursor/Windsurf/Kilo 경로 주석.

### 검증
- `npm run build` green(61 페이지). `dist/_astro/*.css`에 `content-visibility:auto` 확인.
  `index.html` + 상세 페이지에 교정된 매핑("Gemini's DEFAULT file is GEMINI.md", "Kilo Code") 임베드 확인.
- 출처: Gemini CLI docs(GEMINI.md hierarchy, context.fileName), Antigravity rules/issue #16058,
  Codex developers.openai.com(skills, AGENTS.md), OpenCode docs, Cursor docs, Windsurf/Devin docs, Kilo docs.
