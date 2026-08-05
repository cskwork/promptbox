---
title: to-questionnaire
summary: "혼자서는 답할 수 없는 결정을, 그걸 아는 사람에게 넘길 질문지(Markdown)로 바꿔 준다. 주제 자체가 아니라 '누구에게 보내고 무엇을 받아야 하는지'만 물어보고 나머지를 채운다."
summary_en: "Turns a decision you can't answer alone into a Markdown questionnaire for the person who can — it interviews you about the send, not the subject."
tags: [skill, questionnaire, discovery, stakeholder, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/productivity/to-questionnaire
author: mattpocock
license: mattpocock/skills 참조
order: 34
trigger: "질문지 만들어 줘 / 이건 담당자한테 물어봐야 해 / 킥오프 전 요구사항 수집 / discovery questionnaire / 클라이언트 인테이크 문서"
install: "npx skills add https://github.com/mattpocock/skills --skill to-questionnaire"
---

## 한 줄

**모르는 걸 아는 사람에게 넘기는 문서를 대신 써 준다.** 사용자를 주제에 대해 캐묻지 않고, 보내는 행위에 대해서만 캐묻는다.
*EN: It writes the document that hands your unknowns to the person who holds them.*

## 언제 쓰는가

- 프로젝트를 시작해야 하는데 도메인 지식이 상대방(클라이언트, 타 팀, 레거시 담당자)에게만 있을 때
- 미팅 한 번으로 끝내야 해서 우선순위대로 정리된 질문 목록이 필요할 때
- async(비동기)로 답을 받아야 해서 한 번에 제대로 물어봐야 할 때

## 무엇을 하는가

핵심 아이디어는 **the send를 grill한다**(보내는 맥락을 캐묻는다)는 것이다. 사용자는 주제는 몰라도 "누구에게 보내는지"와 "무엇을 받아야 하는지"는 항상 답할 수 있다. 질문지의 질문들은 그 둘 사이의 **gap(간극)** — 수신자는 알지만 사용자는 모르는 것 — 을 겨냥해 만들어진다.

1. **누구에게 보내는가** — 한 번의 교환으로 수신자의 역할·전문성·관계를 파악. 문서의 톤과 담아야 할 배경 설명 분량이 여기서 정해진다.
2. **무엇을 받아야 하는가** — 사용자가 혼자 못 푸는 결정·사실의 구체적 목록.
3. **질문지 작성** — `to-questionnaire-<slug>.md`로 현재 디렉터리에 저장하고 경로를 알려 준다.

## 함정

- **`disable-model-invocation: true`** — 모델이 알아서 부르지 않는다. `/to-questionnaire`로 직접 호출해야 한다.
- **질문 하나에 아이디어 하나.** compound question(두 개를 붙인 질문)은 반쪽 답만 돌아온다.
- **중요한 것부터 위로.** async라면 한 번의 패스밖에 못 얻을 수 있다.
- *why this matters*(왜 중요한지) 한 줄은 오해될 여지가 있거나 성의 없는 답이 나올 만한 질문에만 붙인다. 전부 붙이면 문서가 길어져 아무도 안 읽는다.

```markdown
---
name: to-questionnaire
description: Turn a decision you can't fully answer into a questionnaire for someone else to fill in.
disable-model-invocation: true
---

Turn something the user can't answer alone into a **questionnaire** — a Markdown document they hand to one person to fill in async, or fill out together over a meeting. The recipient holds knowledge the user lacks; the questionnaire pulls it out of them.

**Grill the send, not the subject.** Interview the user only about the _send_, which they can always answer: who it goes to, and what they need back. The questions in the document then target the **gap** between what the recipient knows and what the user needs.

1. **Who is it going to?** Ask, in one exchange, the recipient's role, expertise, and relationship to the user. This fixes the questionnaire's tone and how much context it must carry. Done when you know who the recipient is and what they know that the user doesn't.

2. **What do you need back?** Ask, in one exchange, the specific decisions or facts the user can't resolve alone and needs from this person. Done when you have a concrete list of what the user must walk away able to do or decide.

3. **Write the questionnaire.** Draft questions aimed at the gap from steps 1–2, following the Document structure below. Write it to `to-questionnaire-<slug>.md` in the current directory (slug from the topic) and report the path. Done when the file exists and every item the user named in step 2 is covered by a question.

## Document structure

Frame the document as a **discovery questionnaire**: the user lacks context, the recipient holds it. Order questions most-important-first — async means you may only get one pass — and group them under `##` headings by theme once there are more than a handful. Write it using the template below.

<questionnaire-template>

# <Questionnaire title>

**Purpose:** why this questionnaire exists and the decision riding on it.

**From:** <the user> — **To:** <the recipient> — **How your answers will be used:** <where they go>

## Context

One paragraph orienting a recipient who wasn't in the user's head. Enough to answer well, not a page.

## How to answer

Deadline and rough effort. Partial answers and "I don't know" are useful — flag anything you're unsure of rather than skipping it.

## <Theme heading>

One `##` section per theme. Under each, its questions, most-important-first. Every question is one idea — never compound — with an answer stub directly beneath, and a one-line _why this matters_ only where the question could be misread or invite a throwaway answer.

<question-example>
### What load is the system expected to handle at launch?

_Why this matters: it decides whether we provision for burst traffic now or defer it._

>
</question-example>

## Anything else?

A closing catch-all: anything we didn't ask that we should know?

</questionnaire-template>
```
