---
title: teach
summary: "현재 디렉터리를 '학습 작업실'로 삼아 여러 세션에 걸쳐 한 주제를 가르친다. 왜 배우려는지(미션)를 먼저 캐묻고, 짧고 예쁜 HTML 레슨을 하나씩 만들며, 무엇을 배웠는지 기록으로 남겨 다음에 가르칠 것을 정한다."
summary_en: "Turns the current directory into a stateful teaching workspace — a mission you're grounded in, short beautiful HTML lessons, reference sheets, and learning records that decide what comes next."
tags: [skill, teaching, learning, spaced-repetition, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/productivity/teach
author: mattpocock
license: mattpocock/skills 참조
order: 30
trigger: "이거 가르쳐 줘 / teach me X / 처음부터 배우고 싶어 / 학습 커리큘럼 만들어 줘"
install: "npx skills add https://github.com/mattpocock/skills --skill teach"
---

## 한 줄

**한 번의 답변이 아니라 여러 세션에 걸친 상태 있는(stateful) 학습.** 현재 디렉터리가 곧 학습 작업실이고, 학습 상태는 그 안의 파일들에 남는다.

*EN: A stateful request — they intend to learn the topic over multiple sessions.*

## 작업실 구조

| 파일 | 역할 |
|---|---|
| `MISSION.md` | **왜** 이 주제에 관심이 있는가. 모든 교육의 근거 |
| `./lessons/*.html` | 레슨. 미션에 묶인, 딱 하나만 가르치는 자족적 HTML 파일. **주된 산출물** |
| `./reference/*.html` | 압축된 학습 결과 — 치트시트, 알고리즘, 문법, 요가 자세, 용어집. 인쇄해도 예쁘게 |
| `./learning-records/*.md` | 무엇을 배웠는지의 기록. 소프트웨어의 ADR에 대응. 다음에 뭘 가르칠지 계산하는 근거 |
| `RESOURCES.md` | 근거로 삼을 신뢰도 높은 외부 자료 목록 |
| `./assets/*` | 레슨들이 공유하는 재사용 컴포넌트 |
| `NOTES.md` | 사용자 선호·작업 메모 |

## 철학 — 지식·기술·지혜

- **Knowledge(지식)** — 신뢰도 높은 자료에서 얻는다. **parametric knowledge(모델이 기억으로 아는 것)를 절대 믿지 않는다.**
- **Skills(기술)** — 그 지식을 바탕으로 만든 상호작용 레슨으로 익힌다.
- **Wisdom(지혜)** — 다른 학습자·실무자와 부딪히며 얻는다. 지혜가 필요한 질문은 답을 시도하되 최종적으로 **커뮤니티**로 위임한다.

### fluency vs storage strength

**fluency strength**(그 순간의 인출)는 숙달했다는 착각을 준다. 진짜 목표는 **storage strength**(장기 보존)이고, 이건 desirable difficulty(바람직한 어려움)로 만든다 — retrieval practice(기억에서 끄집어내기), spacing(간격 두기), interleaving(관련 주제 섞기, 기술 연습에만).

**지식 습득에는 어려움이 적**이다(작업기억을 잡아먹으니까). **기술 습득에는 어려움이 도구**다.

## 함정

- **`disable-model-invocation: true`** — `/teach`로 직접 호출.
- **미션 없이 시작하지 않는다.** `MISSION.md`가 비어 있으면 첫 할 일은 "왜 배우려 하는가"를 캐묻는 것. 미션을 모르면 레슨이 추상적으로 뜨고, 다음에 뭘 할지 판단할 근거가 없다.
- **레슨은 짧게.** 학습자의 작업기억은 아주 작다. 대신 매번 하나의 손에 잡히는 성취가 있어야 한다.
- **assets 재사용이 기본값.** 레슨을 쓰기 전에 `./assets/`를 읽고 이미 있는 컴포넌트로 만든다. 공용 스타일시트는 모든 작업실이 가장 먼저 얻는 컴포넌트 — 그래야 레슨 더미가 아니라 하나의 강좌로 보인다.
- **퀴즈 선택지는 글자 수를 맞춘다.** 형식으로 정답 힌트를 주면 안 된다.
- 레슨에는 인용을 잔뜩 — 주장마다 외부 자료 링크. 그리고 "모르겠으면 에이전트(=선생)에게 다시 물어보라"는 안내를 넣는다.

## 원문 SKILL.md (전문)

```markdown
---
name: teach
description: Teach the user a new skill or concept, within this workspace.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

The user has asked you to teach them something. This is a stateful request - they intend to learn the topic over multiple sessions.

## Teaching Workspace

Treat the current directory as a teaching workspace. The state of their learning is captured in this directory in several files:

- `MISSION.md`: A document capturing the _reason_ the user is interested in the topic. This should be used to ground all teaching. Use the format in [MISSION-FORMAT.md](./MISSION-FORMAT.md).
- `./reference/*.html`: A directory of reference materials. These are the compressed learnings from the lessons - cheat sheets, reference algorithms, syntax, yoga poses, glossaries. They are the raw units of learning. They should be beautiful documents which print out well, and are designed for quick reference.
- `RESOURCES.md`: A list of resources which can be explored to ground your teaching in contextual knowledge, or to acquire knowledge and wisdom. Use the format in [RESOURCES-FORMAT.md](./RESOURCES-FORMAT.md).
- `./learning-records/*.md`: A directory of learning records, which capture what the user has learned. These are loosely equivalent to architectural decision records in software development - they capture non-obvious lessons and key insights that may need to be revised later, or drive future sessions. These should be used to calculate the zone of proximal development. They are titled `0001-<dash-case-name>.md`, where the number increments each time. Use the format in [LEARNING-RECORD-FORMAT.md](./LEARNING-RECORD-FORMAT.md).
- `./lessons/*.html`: A directory of lessons. A **lesson** is a single, self-contained HTML output that teaches one tightly-scoped thing tied to the mission. This is the primary unit of teaching in this workspace.
- `./assets/*`: Reusable **components** shared across lessons. See [Assets](#assets).
- `NOTES.md`: A scratchpad for you to jot down user preferences, or working notes.

## Philosophy

To learn at a deep level, the user needs three things:

- **Knowledge**, captured from high-quality, high-trust resources
- **Skills**, acquired through highly-relevant interactive lessons devised by you, based on the knowledge
- **Wisdom**, which comes from interacting with other learners and practitioners

Before the `RESOURCES.md` is well-populated, your focus should be to find high-quality resources which will help the user acquire knowledge. Never trust your parametric knowledge.

Some topics may require more skills than knowledge. Learning more about theoretical physics might be more knowledge-based. For yoga, more skills-based.

### Fluency vs Storage Strength

You should be careful to split between two types of learning:

- **Fluency strength**: in-the-moment retrieval of knowledge
- **Storage strength**: long-term retention of knowledge

Fluency can give the user an illusory sense of mastery, but storage strength is the real goal. Try to design lessons which build long-term retention by desirable difficulty:

- Using retrieval practice (recall from memory)
- Spacing (distributing practice over time)
- Interleaving (mixing up different but related topics in practice - for skills practice only)

## Lessons

A lesson is the main thing you produce — the unit in which knowledge and skills reach the user. Each lesson is one self-contained HTML file, saved to `./lessons/` and titled `0001-<dash-case-name>.html` where the number increments each time.

A lesson should be **beautiful** — clean, readable typography and layout — since the user will return to these later to review. Think Tufte.

The lesson should be short, and completable very quickly. Learners' working memory is very small, and we need to stay within it. But each lesson should give the user a single tangible win that they can build on. It should be directly tied to the mission, and should be in the user's zone of proximal development.

If possible, open the lesson file for the user by running a CLI command.

Each lesson should link via HTML anchors to other lessons and reference documents.

Each lesson should recommend a primary source for the user to read or watch. This should be the most high-quality, high-trust resource you found on the topic.

Each lesson should contain a reminder to ask followup questions to the agent. The agent is their teacher, and can assist with anything that's unclear.

## Assets

Lessons are built from reusable **components**, stored in `./assets/`: stylesheets, quiz widgets, simulators, diagram helpers — anything a second lesson could reuse.

Reuse is the default, not the exception. Before authoring a lesson, read `./assets/` and build from the components already there. When a lesson needs something new and reusable, write it as a component in `./assets/` and link to it — never inline code a future lesson would duplicate.

A shared stylesheet is the first component every workspace earns: every lesson links it, so the lessons look like one consistent course rather than a pile of one-offs. As the workspace grows, so should the component library.

## The Mission

Every lesson should be tied into the mission - the reason that the user is interested in learning about the topic.

If the user is unclear about the mission, or the `MISSION.md` is not populated, your first job should be to question the user on why they want to learn this.

Failing to understand the mission will mean knowledge acquisition is not grounded in real-world goals. Lessons will feel too abstract. You will have no way of judging what the user should do next.

Missions may change as the user develops more skills and knowledge. This is normal - make sure to update the `MISSION.md` and add a learning record to capture the change. Confirm with the user before changing the mission.

## Zone Of Proximal Development

Each lesson, the user should always feel as if they are being challenged 'just enough'.

The user may specify an exact thing they want to learn. If they don't, figure out their zone of proximal development by:

- Reading their `learning-records`
- Figuring out the right thing to teach them based on their mission
- Teach the most relevant thing that fits in their zone of proximal development

## Knowledge

Lessons should be designed around a skill the user is going to learn. The knowledge in the lesson should be only what's required to acquire that skill. You teach the knowledge first, then get the user to practice the skills via an interactive feedback loop.

Knowledge should first be gathered from trusted resources. Use `RESOURCES.md` to keep track of them. Lessons should be littered with citations - links to external resources to back up any claim made. This increases the trustworthiness of the lesson.

For acquiring knowledge, difficulty is the enemy. It eats working memory you need for understanding.

## Skills

If knowledge is all about acquisition, skills are about durability and flexibility. Make the knowledge stick.

For skill acquisition, difficulty is the tool. Effortful retrieval is what builds storage strength. Skills should be taught through interactive lessons. There are several tools at your disposal:

- Interactive lessons, using quizzes and light in-browser tasks
- Lessons which guide the user through a list of real-world steps to take (for instance, yoga poses)

Each of these should be based on a **feedback loop**, where the user receives feedback on their performance. This feedback loop should be as tight as possible, giving feedback immediately - and ideally automatically.

For quizzes, each answer should be exactly the same number of words (and characters, if possible). Don't give the user any clues about the answer through formatting.

## Acquiring Wisdom

Wisdom comes from true real-world interaction - testing your skills outside the learning environment.

When the user asks a question that appears to require wisdom, your default posture should be to attempt to answer - but to ultimately delegate to a **community**.

A community is a place (online or offline) where the user can test their skills in the real world. This might be a forum, a subreddit, a real-world class (budget permitting) or a local interest group.

You should attempt to find high-reputation communities the user can join. If the user expresses a preference that they don't want to join a community, respect it.

## Reference Documents

While creating lessons, you should also create reference documents. Lessons can reference these documents - they are useful for tracking raw units of knowledge useful across lessons.

Lessons will rarely be revisited later - reference documents will be. They should be the compressed essence of the lesson, in a format designed for quick reference.

Some learning topics lend themselves to reference:

- Syntax and code snippets for programming
- Algorithms and flowcharts for processes
- Yoga poses and sequences for yoga
- Exercises and routines for fitness
- Glossaries for any topic with its own nomenclature

Glossaries, in particular, are an essential reference. Once one is created, it should be adhered to in every lesson.

## `NOTES.md`

The user will sometimes express preferences of how they want to be taught, or things you should keep in mind. This is the place to record those preferences, so you can refer back to them when designing lessons or working with the user.
```
