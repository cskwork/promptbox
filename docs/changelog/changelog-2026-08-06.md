# 2026-08-06 — 폐기된 mattpocock 스킬 이름(to-prd/to-issues/qa/writing-great-skills) 정리 + v0.3.0

mattpocock/skills upstream(1.2.2 기준)을 대조한 결과, 이미 이 저장소에 리네임 안내문(`> 이름이
바뀌었습니다`)까지 있는 세 스킬(`to-spec`·`to-tickets`·`writing-for-agents`)의 **옛 이름**이 다른
문서의 목록·표에는 그대로 남아 있었다. `qa`는 PR #752로 upstream에서 완전히 삭제(→`triage`+`to-tickets`로
흡수)됐는데도 여전히 언급되고 있었다. zoom-out 제거(2026-06-23) 때와 같은 종류의 dangling 참조.

## 변경 (왜)

- `src/data/onboarding.ts`: `ONBOARDING_PICKS`의 `{ slug: 'writing-great-skills' }` →
  `{ slug: 'writing-for-agents' }`. 옛 슬러그는 대응 콘텐츠 엔트리가 없어 `DeveloperPicks.astro`에서
  silent skip되던 dangling 참조였다.
- `README.md`: 대표 포함 항목 목록의 `writing-great-skills` → `writing-for-agents`.
- `src/content/skills/setup-matt-pocock-skills.md`: "원문 SKILL.md (전문)" 임베디드 블록의
  frontmatter `description`과 Section A explainer 문단을 upstream 현재 파일 텍스트로 교체 —
  옛 목록(`to-issues`, `to-prd`, `qa`)이 현재 upstream 텍스트(`to-tickets`, `to-spec`, `qa` 언급 없이
  단순화)와 어긋나 있었다.
- `src/content/skills/claude-code-workflow-cheatsheet.md`: Harness 표와 Matt Pocock's skills 워크플로
  블록의 `/to-prd` → `/to-spec`, `/to-issues` → `/to-tickets`.
- `package.json`: 0.2.0 → 0.3.0 (2026-08-07 온보딩 프롬프트 개정과 같은 릴리스로 묶음).

## 결정/대안

- `src/content/prompts/agents-quick-onboarding.md`(및 en 번역)는 grep 결과 해당 옛 이름을 포함하지
  않아 수정 대상에서 제외.
- `setup-matt-pocock-skills.md`의 임베디드 블록은 두 문단만 upstream 현재 텍스트로 교체했고, 그 외
  프로세스 설명은 손대지 않았다 — 전체 재동기화는 이번 범위 밖.
- 각 리네임 스킬 페이지(`to-spec.md`, `to-tickets.md`, `writing-for-agents.md`, `domain-modeling.md`,
  `codebase-design.md`)에 이미 있는 "이름이 바뀌었습니다" 안내 인용문은 옛 이름을 의도적으로 남겨두는
  문서이므로 그대로 둠 — 이번 정리 대상은 "목록/표"에 남은 옛 이름이지 이 설명문이 아니다.
- `claude-code-workflow-cheatsheet.md`의 `/diagnose`(upstream 실제 이름은 `diagnosing-bugs`)는 이번
  changelog가 근거로 삼은 upstream CHANGELOG의 리네임/삭제 이력에 없어 미확인 상태로 손대지 않음 — 별도
  확인 후 후속 처리 권장.

## 검증

- `npm run build` green (96 page(s) built, 에러 없음) — 프로젝트의 권위 있는 검증. `/skills/writing-for-agents/`
  포함 정상 생성 확인.
- `grep -rn "to-prd\|to-issues\|writing-great-skills" src/ README.md` → 남은 참조는 모두 각 스킬
  페이지의 의도된 "이름이 바뀌었습니다" 안내문뿐(0건의 dangling list 참조).

## 후속 (이번 범위 밖)

- `claude-code-workflow-cheatsheet.md`의 `/diagnose` 표기가 upstream `diagnosing-bugs`와 일치하는지
  별도 확인 필요.
- 이전 changelog(2026-06-23)에 남아있던 `onboarding.ts` INSTALL_PROMPT ↔ `agents-quick-onboarding.md`
  간 `call-agent` 동기화 누락은 이번 작업과 무관해 그대로 미해결로 남김.
