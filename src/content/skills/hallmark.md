---
title: hallmark
summary: "에이전트가 만든 UI에서 'AI가 뽑은 티'를 걷어내는 디자인 스킬. 색만 바꾼 같은 템플릿이 아니라 구조 자체가 다른 화면을 만들도록 강제한다. 신규 페이지·감사·리디자인, URL이나 스크린샷에서 디자인 추출까지."
summary_en: "Anti-AI-slop design skill. Forces structural variety, not just colour swaps, so two briefs produce two different-feeling sites. Greenfield, audit, redesign, or extract a design from a URL or screenshot."
tags: [skill, design, ui, frontend, landing-page, anti-slop, together-ai]
source: https://github.com/Nutlope/hallmark
author: Nutlope
license: MIT
order: 32
trigger: "hallmark / 랜딩 페이지 만들어줘 / 이 UI 리디자인 / audit this design / study this site"
install: "npx skills add nutlope/hallmark"
---

## 한 줄

LLM이 학습한 기본값(hero → 기능 3개 → CTA → footer)으로 되돌아가는 것을 막는 디자인 규칙집. **구조적 다양성**을 요구한다는 점이 다른 디자인 스킬과 갈리는 지점이다.

*EN: Makes the UIs agents generate look made, not generated.*

## 언제 쓰는가

- 랜딩 페이지·신규 앱 화면을 처음부터 만들 때
- 이미 만든 화면이 "어디서 본 것 같다"는 느낌일 때 (audit)
- 참고할 사이트 URL이나 스크린샷이 있고 그 결을 가져오고 싶을 때 (study)
- 에이전트가 만든 UI가 매번 같은 리듬으로 나올 때

## 무엇을 하는가

네 가지 모드로 동작한다.

| 모드 | 쓰임 |
|---|---|
| greenfield | 새 페이지·앱을 백지에서 |
| audit | 기존 화면의 slop 요소를 짚어낸다 |
| redesign | 감사 결과를 반영해 다시 만든다 |
| study | URL·스크린샷에서 디자인 언어를 추출 |

핵심 주장은 **구조적 다양성**이다. 서로 다른 두 브리프로 만든 두 페이지가 같은 섹션 리듬을 공유하면 실패로 본다 — 색상 팔레트만 다른 같은 템플릿이 아니라, 다른 사이트처럼 느껴져야 한다. 규칙 근거는 Anthropic의 frontend-design 스킬, Claude cookbook의 frontend aesthetics, 2026년 "tactile rebellion" 흐름의 교집합에서 가져왔다.

의도적으로 짧고 단조롭게 쓰여 있다 — 모델이 규칙을 건너뛰고 기본값으로 새는 것을 막기 위해서다.

## 함정

- **디자인 시스템이 이미 있는 제품에는 과할 수 있다.** 구조적 다양성을 강제하므로, 일관된 컴포넌트 규격을 지켜야 하는 사내 어드민 화면에는 오히려 방해가 된다. 그런 곳엔 기존 토큰·컴포넌트를 따르는 지시가 낫다.
- `study` 모드로 남의 사이트를 추출할 때는 시각 언어를 배우는 선에서 멈춘다. 레이아웃·카피를 그대로 복제하면 저작권 문제가 된다.
- Together AI가 후원하는 프로젝트다. 스킬 자체는 규칙집이라 별도 결제가 필요 없지만, 문서에 등장하는 일부 예시는 그쪽 서비스를 전제한다.
