# Design System: promptbox

복사해서 바로 쓰는 AI 코딩 에이전트 도구 카탈로그의 시각 언어. 이 문서는 실제 코드
(`src/styles/global.css`, `tailwind.config.mjs`, 컴포넌트)에 구현된 규칙을 단일 기준으로 정리한다.

## 1. Visual Theme & Atmosphere

Density 5 · Variance 5 · Motion 5. 차분한 "개발자 도구" 분위기 — 은은한 emerald 방사형
그라데이션 캔버스 위에 명확한 경계의 밝은 표면을 얹고, 터미널 모티프(블링킹 caret, 명령 데모)로
"복사 → 사용"이라는 제품의 본질을 시각화한다. 화려함보다 가독성과 스캔 속도 우선.

## 2. Color Palette & Roles

- **Canvas** — `linear-gradient(#f7f9f8 → #eef2f1)` + emerald/teal 방사형 글로우 (light) / `#060a0c → #080d12` (dark). 고정 배경.
- **Ink scale** (`#f6f7f9` → `#070912`) — 절대 중립 그레이. 본문/보조 텍스트, 보더, 표면. 순수 검정 미사용.
- **Accent: Emerald** (`#10b981`, 보조 `#34d399`/`#059669`) — 단일 accent. CTA·활성·포커스 링·복사 성공 상태. "복사=성공"이라 브랜드 색이 곧 성공 색.
- **Category hues** — wayfinding 전용 미세 틴트(prompts=sky, skills=violet, tools=blue …). 카드 보더/아이콘 타일에만 쓰고 본문에는 침범하지 않는다.
- 금지: 네온 아웃터 글로우, AI 퍼플/블루 글로우, 과채도 accent, 순수 검정.

## 3. Typography

- **Sans (Display + Body): `Geist`** — Inter 대체(taste anti-generic). 헤드라인은 track-tight(`-0.02em`), weight·color로 위계. Hero h1은 `clamp(2rem, 1.2rem+3.4vw, 3.25rem)` 유동 스케일.
- **Mono: `JetBrains Mono`** — 터미널 데모, 라벨, 카테고리 칩, 수치, kbd 힌트.
- 본문 최소 `1rem`, 카드 요약은 `line-clamp`로 2줄 고정. 금지: Inter, 일반 serif(대시보드 serif 금지).

## 4. Component Stylings

- **glass-card** — 거의 불투명한 흰/잉크 표면 + 1px 중립 보더. 반복 카드·태그에는 blur를 쓰지 않고 고정 헤더에만 남긴다. hover 시 `-translate-y-0.5` + 중립 틴트의 확산 그림자(네온 아님), 보더가 카테고리 hue로 점등.
- **Buttons** — `.btn-primary`는 emerald 채움 + 부드러운 확산 그림자, active 시 `translate-y-px` 촉각 피드백. `.btn-ghost`는 아웃라인. 아웃터 글로우 없음.
- **Inputs** — `.glass-input`, 포커스 시 accent 링. 표준 라벨/헬퍼/에러 배치.
- **Terminal block** (`.pc-term`) — 잉크-950 표면의 시그니처 모티프. mac 트래픽 라이트 + 명령 데모 + 블링킹 caret.
- **Rendering** — 본문과 카드는 기본 표시. 가변 높이 카드의 `content-visibility` 추정값이 카테고리 이동 위치를 바꾸므로 높이 추정을 쓰지 않는다. 스크롤 이벤트로 콘텐츠 표시를 제어하지 않는다.

## 5. Layout Principles

- Hero는 중앙정렬 금지. 짧은 비대칭 소개 다음에 카탈로그 검색과 카테고리 바로가기를 배치한다. 터미널 데모는 데스크톱에만 표시한다.
- 카탈로그는 카테고리별 `grid sm:grid-cols-2 xl:grid-cols-3`. 768px 미만 단일 컬럼 붕괴, 가로 스크롤 없음.
- `max-w-8xl`(88rem) 컨테이너 중심 정렬. 사이드바 + 본문 2단(모바일은 세로).
- 사이드바는 접을 수 있는 카테고리 목록. 검색은 홈에서 카탈로그 바로 위, 상세 페이지에서 사이드바 위에 배치한다. 검색 중에는 일치하는 카드와 목록을 함께 표시한다.
- 사용법과 스타터 키트는 카탈로그 뒤에 두며 앵커 링크로 바로 접근한다. 설치 프롬프트와 용어 설명은 native details로 펼친다. 원문은 변경하지 않는다.
- 요소 겹침 금지 — 모든 요소가 고유 공간 점유.

## 6. Motion & Interaction

- 소개만 6px 이동으로 짧게 진입한다. 카탈로그는 관찰자나 애니메이션 없이 즉시 표시한다.
- `/`로 검색창 이동, Escape로 검색 초기화. 결과 수는 live region으로 전달한다. 모바일 메뉴는 스크립트 초기화가 성공한 뒤에만 접는다.
- 블링킹 caret = 유일한 무한 루프 micro-loop(브랜드 글리프).
- `transform`/`opacity`만 애니메이트. `prefers-reduced-motion`에서 전부 무력화.

## 7. Anti-Patterns (Banned)

이모지 · Inter · 일반 serif · 순수 검정(`#000`) · 네온/아웃터 글로우 · 과채도 accent ·
대형 헤더 그라데이션 텍스트 · 커스텀 커서 · 요소 겹침 · 3-equal-card 행(비대칭/zig-zag 사용) ·
"John Doe"/"Acme" 류 가짜 이름 · 지어낸 통계/수치 · "Scroll to explore"·바운싱 셰브론 등 필러 ·
깨진 이미지 링크.
