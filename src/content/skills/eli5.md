---
title: eli5
summary: "/eli5 <주제>를 5살 그림책으로 설명하게 하는 한 줄짜리 스킬. 외부 의존성 없는 HTML 파일 하나에 큰 그림과 몇 마디 단어로 개념을 보여준다."
summary_en: "One line that turns any topic into a picture book: /eli5 <topic> renders a standalone HTML artifact that explains with big pictures and few words."
tags: [skill, eli5, explainer, teaching, html-artifact]
source: https://github.com/anthropics/claude-plugins-community/tree/main/eli5
author: anthropics
license: Apache-2.0
order: 29
trigger: "/eli5 <주제> / 5살처럼 설명해 줘 / 그림으로 설명해 줘"
install: "git clone --depth=1 https://github.com/anthropics/claude-plugins-community ~/.agents/sources/anthropics-claude-plugins-community && ln -sfn ~/.agents/sources/anthropics-claude-plugins-community/eli5/skills/eli5 ~/.agents/skills/eli5"
mirror_of: https://raw.githubusercontent.com/anthropics/claude-plugins-community/main/eli5/skills/eli5/SKILL.md
---

## 한 줄

**아무 주제나 5살 그림책으로 바꿔라.** 스킬 전체가 명령 두 줄이다.
*EN: "Explain any topic like I'm 5 — as an HTML picture book."*

> **온보딩 키트 기본 포함.** [퀵 온보딩 프롬프트](../../prompts/agents-quick-onboarding/)는 워크플로 세트를
> A(Agent Skills)·B(Superpowers)·C(Matt Pocock) 중 하나만 깔지만, 이 스킬은 **어느 걸 골라도 깐다**.
> 파이프라인도 라우터도 없는 몇 줄짜리라 세트와 충돌할 여지가 없기 때문이다.

## 언제 쓰는가

- 에이전트의 글로는 deep learning, OAuth, git rebase 같은 개념이 도무지 안 붙을 때
- 비전공자·주니어·아이에게 설명해야 할 때
- "말 말고 그림으로"가 필요할 때

## 무엇을 하는가

`/eli5 <주제>` 한 번이면 끝이다. 에이전트가 아무것도 안다고 가정하지 않고, 외부 의존성 없는 HTML artifact(파일 하나로 완결되는 산출물)를 만들어 큰 그림과 최소한의 단어로 주제를 설명한다. 그림은 보통 인라인 SVG(코드로 그리는 벡터 이미지)로 그려진다.

## 함정

- **직접 부르는 게 확실하다.** description에는 `/eli5 <topic>`을 쓰라고 적혀 있지만, 본문은 `$ARGUMENTS`(슬래시 명령 뒤 인자 자리표) 하나뿐인 초경량 스킬이라 모델이 스스로 발동하기보다 내가 호출하는 용도다.
- **파일을 써서 브라우저로 열 수 있는 하네스가 전제다.** Claude Code처럼 HTML artifact를 만들어 열어볼 수 있는 환경에서 빛난다.
- 그림 품질은 모델 몫이다. 결과가 밋밋하면 "bigger pictures, fewer words"를 덧붙여 다시 요청하는 편이 낫다.

## 원문 SKILL.md (전문)

```markdown
---
name: eli5
description: Explain a topic like I'm a 5 year old. Use when the user types /eli5 <topic> or asks for a dead-simple picture explainer of how something works.
---

# eli5

Explain like I'm someone who knows nothing about this topic, using a HTML artifact with big pictures and few words.

Topic: $ARGUMENTS
```
