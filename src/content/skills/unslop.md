---
title: unslop
title_en: Unslop
summary: "AI 냄새(AI tell)가 나는 글버릇 31가지를 이름 붙여 잡아내고 고치는 스킬. em dash 금지, 굵은 글씨 남용 금지, '단순히 X가 아니라 Y' 금지처럼 규칙이 구체적이라 판단이 아니라 체크리스트로 돌아간다. 패턴 제거로 끝내지 않고 의견·리듬·구체성을 다시 넣어 목소리를 살린다."
summary_en: "Names 31 AI writing tells and says how to fix each one. The rules are concrete enough to run as a checklist rather than a judgment call: no em dashes, no bolded proper nouns, no 'not just X, but Y.' It also puts voice back in, because stripping the patterns alone leaves prose that reads just as machine-made."
tags: [skill, writing, editing, ai-slop, prose, style-guide, pstack, cursor]
source: https://github.com/cursor/plugins/tree/main/pstack/skills/unslop
author: Lauren Tan (poteto)
license: MIT
order: 20
trigger: "글을 쓸 때 항상. description이 'Must always apply'라서 보고서·커밋 메시지·주석·문서 등 모든 산문에 상시 적용된다."
install: "/add-plugin pstack (Cursor). 다른 하네스는 SKILL.md만 스킬 디렉터리에 복사한다."
---

## 한 줄

LLM이 쓴 글에서 나는 특유의 냄새를 31개 항목으로 이름 붙이고, 각각을 어떻게 고치는지까지 적어 둔
편집 스킬이다. pstack 플러그인의 일부이고, description이 `Must always apply`라 에이전트가 산문을
쓸 때마다 걸린다.

## 언제 쓰는가

- 커밋 메시지, PR 설명, README, 보고서처럼 사람이 읽을 글을 에이전트가 쓸 때
- "AI가 쓴 티가 난다"는 지적을 받았는데 어디가 문제인지 짚어내지 못할 때
- 글쓰기 규칙을 팀 컨벤션으로 고정하고 싶을 때. 취향 논쟁 대신 번호로 지목할 수 있다

## 무엇을 하는가

31개 패턴을 6개 묶음으로 나눈다. 내용(과장, 출처 없는 인용, "~하면서"류 분사구), 언어(AI 어휘,
"단순히 X가 아니라 Y", 삼단 나열 강박), 스타일(em dash, 콜론, 굵은 글씨, 제목 대문자, 이모지),
소통 부산물(챗봇 말투, 아부), 군더더기, 전문용어 흉내(substrate, vector, surface 같은 추상 명사).

핵심은 마지막 두 묶음이다. 27번은 "느낌이 아니라 동작을 써라"고 요구한다. "SQL을 읽기 쉽게 해준다"
대신 "`.toSQL()`이 DB로 보내는 문자열을 그대로 반환한다"로 바꾸라는 식이다. 검증 기준도 준다.
그 문장이 다른 프로젝트 문서에 그대로 들어가도 말이 되면, 이 프로젝트에 대해 아무것도 말하지
않는 문장이니 지운다.

## 함정

- **패턴 제거만 하면 실패한다.** 스킬 본문이 직접 경고한다. 특징을 다 지운 무미건조한 글도 똑같이
  AI 티가 난다. "Adding soul" 절의 의견 갖기, 문장 길이 섞기, 1인칭 허용을 같이 적용해야 한다.
- **em dash 금지는 괄호로 우회하는 것까지 막는다.** 13번이 괄호, en dash, 하이픈 대체를 전부 닫는다.
  생각을 나누고 싶으면 문장을 끝내거나 쉼표를 쓴다.
- **16번은 굵은 글씨 리드인을 전부 금지하지 않는다.** 문제는 라벨이 뒤 문장을 그대로 반복하는 경우다.
  `**Performance:** 성능이 좋아졌다`는 걸리고, 새 정보가 뒤따르는 리드인은 통과한다.
- 한국어 글에는 어휘 목록(7번)이 적용되지 않는다. 남는 것은 구조 규칙 9, 10, 13, 16, 27~31이다.

```markdown
---
name: unslop
description: Cut AI tells from any writing. Must always apply.
---

# Unslop

Edit text to remove AI patterns and add human voice.

## Process

1. Scan for the patterns below.
2. Rewrite. Preserve meaning, match intended tone.
3. Add soul (see next section).
4. Self-audit: "What makes this obviously AI generated?" Fix remaining tells.

## Adding soul

Removing patterns is half the job. Sterile, voiceless writing is just as obvious.

- **Have opinions.** React to facts instead of neutrally listing pros and cons.
- **Vary rhythm.** Short sentences. Then longer ones that take their time. Mix it up.
- **Acknowledge complexity.** "Impressive but also kind of unsettling" beats "impressive."
- **Use "I" when it fits.** First person isn't unprofessional.
- **Let some mess in.** Perfect structure looks machine-made.
- **Be specific.** Not "this is concerning" but "there's something unsettling about agents churning away at 3am."

## Patterns to detect and fix

### Content

1. **Puffery.** "pivotal moment", "testament to", "evolving landscape", "setting the stage for", "indelible mark", "deeply rooted". Cut puffery, state what happened.
2. **Name-dropping.** Listing media outlets without context. Pick one, say what was said.
3. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". Delete or expand with real sources.
4. **Promotional language.** "nestled", "vibrant", "breathtaking", "groundbreaking", "renowned", "stunning", "must-visit". Use neutral descriptions.
5. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete.
6. **Formulaic challenges.** "Despite challenges... continues to thrive." Replace with specific facts.

### Language

7. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. Replace with plain words.
8. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". Just say "is" or "has".
9. **"Not just X, but Y."** State the point directly instead.
10. **Rule of three.** Forcing ideas into groups of three. Use the natural number.
11. **Synonym cycling.** Protagonist, main character, central figure, hero all in one paragraph. Pick one, repeat it.
12. **False ranges.** "from X to Y" where X and Y aren't on a meaningful scale. List topics directly.

### Style

13. **Em dash overuse.** Avoid em dashes entirely. Use periods or commas only (no parentheses, no en dashes, no hyphen-as-dash substitutes). Em dashes are an AI tell, and reaching for parentheses instead just trades one tell for another. If a thought needs separation, end the sentence or use a comma.
14. **Colon overuse.** Colons are fine before a list or example. Not as mid-sentence connectors. "If you're coming from traditional automation: instead of registering event handlers, you describe conditions" adds nothing with the colon. Rewrite to let the point stand on its own without comparison framing. "Describing when the scheduler should fire works best as plain English." Same meaning, no crutch punctuation.
15. **Boldface overuse.** Don't bold every proper noun or acronym.
16. **Inline-header lists.** The tell is a bold label and colon that restates the line: "**Performance:** Performance improved...". Convert those to prose. A bold lead-in that ends in a period, names the item, and is followed by genuinely new detail ("**Schema in TypeScript.** Tables live in one file.") is fine, not a tell.
17. **Title case headings.** Use sentence case.
18. **Decorative emojis.** Remove from headings and bullets.
19. **Curly quotes.** Replace with straight quotes.

### Communication artifacts

20. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" Remove.
21. **Cutoff disclaimers.** "While specific details are limited..." Find sources or remove.
22. **Sycophantic tone.** "Great question! You're absolutely right!" Respond directly.

### Filler

23. **Filler phrases.** "In order to" becomes "To". "Due to the fact that" becomes "Because". "It is important to note that" gets deleted.
24. **Excessive hedging.** "could potentially possibly be argued that it might" becomes "may".
25. **Generic conclusions.** "The future looks bright." State specific plans or facts.

### Jargon

26. **Abstract metaphor nouns.** Substrate, wedge, vector, locus, vantage, nexus, primitive (as noun), harness (as metaphor), surface (as in "API surface"), bedrock, scaffolding (as metaphor), modality, paradigm, gold-plating, ratchet (as metaphor), evacuate (for moving code), endgame, north star, flywheel. These read as technical but usually have a plainer concrete word. "Substrate" becomes "base". "Wedge in" becomes "add". "Vector" becomes "way" or "method". "Gold-plating" becomes "more than the job needs". "Ratchet" becomes the mechanism's real name or "a limit that only tightens". "Evacuate" becomes "move out". "Endgame" becomes "the last phase". Pick the concrete word.

### Plain speech

27. **Say what it does, not how it feels.** "the database stays close at hand", "SQL you can read", "types that follow your schema" name a feeling. The fix names the mechanism or a number: "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". Ask what the sentence tells the reader to do or know, then write that. If you can't restate it as a concrete instruction, fact, or number, cut it. One more check: if the sentence could appear unchanged in another project's docs, it says nothing about this one. Cut it.
28. **Shorten or split dense sentences.** If the reader has to backtrack to parse a sentence, break it in two or drop clauses. One idea per sentence.
29. **Active voice.** Prefer it. Catch "is/are/was/were + past participle" and name the actor: "queries are validated" becomes "the compiler validates queries", "the file is parsed by the loader" becomes "the loader parses the file". Passive is fine only when the actor is unknown or genuinely doesn't matter.
30. **Cut adverbs, or use a stronger verb.** "runs quickly" becomes "is fast" or the number. "significantly improves" becomes the measured delta. An adverb propping up a weak verb means the verb is wrong.
31. **Prefer the plain word.** "utilize" becomes "use", "leverage" becomes "use", "facilitate" becomes "help", "numerous" becomes "many", "in the event that" becomes "if". The fancier synonym is rarely clearer.
```
