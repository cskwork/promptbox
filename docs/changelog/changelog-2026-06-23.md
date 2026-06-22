# 2026-06-23 — 제거된 mattpocock `zoom-out` 스킬 정리 + v0.1.1

mattpocock/skills upstream에서 `zoom-out` 스킬이 삭제됨 → 더 이상 `github.com/mattpocock/skills`에서
받을 수 없는 죽은 참조. 설치 프롬프트가 이를 `-> skills/engineering/zoom-out`으로 안내하면 클론 시
404가 되므로 카탈로그 전반에서 제거.

## 변경 (왜)

- `src/data/onboarding.ts`:
  - `ONBOARDING_PICKS`에서 `{ slug: 'zoom-out' }` 픽 제거 — 대응 콘텐츠 엔트리(`skills/zoom-out`)가
    없어 이미 그리드에서 silent skip되던 dangling 참조.
  - `INSTALL_PROMPT`의 mattpocock 설치 목록에서 zoom-out 줄 제거 + "holds **four** ... copy all four"
    → "holds **three** ... copy all three"로 카운트 보정(이제 grill-with-docs·improve-codebase-architecture·triage 3종).
- `src/content/prompts/agents-quick-onboarding.md`: 위 INSTALL_PROMPT와 동일 페이로드(동기 컨벤션)이므로
  같은 zoom-out 줄 + 카운트 보정 반영.
- `src/content/skills/setup-matt-pocock-skills.md`: 본문·frontmatter description의 "이 스킬들 쓰기 전
  먼저 실행" 목록에서 `zoom-out` 제거(존재하지 않는 스킬을 선행 대상으로 나열하지 않도록).
- `src/content/skills/claude-code-workflow-cheatsheet.md`: 워크플로 치트시트의
  `Explore: /zoom-out | /improve-codebase-architecture` → `Explore: /improve-codebase-architecture`
  (없는 슬래시 명령 제거).
- `package.json`: 0.1.0 → 0.1.1.

## 결정/대안

- 줄 삭제는 공백 정렬 의존을 피해 `grep -vE`로 결정적 처리(LF 파일 2개), 줄 내부 치환은 surgical edit.
  zoom-out 외 라인엔딩/포맷 변경 없음(diff +5/-8, 4파일).
- 범위는 zoom-out 한정. 별도로 발견한 사전 존재 드리프트(아래 후속)는 이번 릴리스에 포함하지 않음.

## 검증

- `npm run build` green — 프로젝트의 권위 있는 검증.
- `grep -rn "zoom-out" src/` → 0건(완전 제거 확인).

## 후속 (이번 범위 밖, 별건 권장)

- `onboarding.ts`의 `INSTALL_PROMPT`에는 `call-agent` 줄이 없는데 `agents-quick-onboarding.md`에는 있음
  (커밋 f527b52가 `.md`만 갱신) → "KEEP IN SYNC" 불변식 위반. 홈(.ts)·카탈로그(.md) 설치 프롬프트가
  갈림. call-agent를 `.ts`에도 추가해 동기화 필요.
