# 2026-08-04 — 온보딩 프롬프트 Operating Instructions 최신화 (Worktrees + grill-with-docs)

로컬 정본 `~/.agents/AGENTS.md`에 적용된 운영 지침이 온보딩 프롬프트의 7단계
(GLOBAL INSTRUCTION FILES) 임베드 블록과 어긋나 있어 동기화. 임베드 블록은
정본과 diff 기준 바이트 단위 동일함을 확인.

## 변경 (왜)

- `src/content/prompts/agents-quick-onboarding.md` 임베드 Operating Instructions:
  - **Worktrees** 절 추가 — Git worktree를 기본으로 만들지 않고 사용자 승인을 받도록.
    로컬 정본에는 이미 있었으나 프롬프트에는 누락되어 있던 절.
  - **2. Plan** 말미에 grill 단계 추가 — 계획 수립 후 `grill-with-docs`
    (`grilling` 세션 + `domain-modeling`, ADR/용어집 산출)로 사용자 의도를
    확인·확정하기 전에는 구현을 시작하지 않도록. `grill-with-docs`는
    `disable-model-invocation: true`라 모델이 직접 못 부를 수 있으므로,
    구성 스킬(`grilling`, `domain-modeling`)을 병기해 폴백 경로를 지침에 내장.

영문 번역(`translations/en`)은 설명부만 보유하고 프롬프트 코드블록은 기본 파일에서
렌더링되므로 수정 불필요.
