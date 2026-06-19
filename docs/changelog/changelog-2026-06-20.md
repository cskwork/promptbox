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
