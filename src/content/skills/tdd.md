---
title: tdd
summary: "테스트를 한 번에 다 쓰지 말고, 테스트 하나 작성 → 통과시킬 코드 작성을 한 사이클씩 반복하게 해주는 테스트 우선 개발 가이드. 한꺼번에 쓴 테스트는 잘 깨지고 쓸모없어진다."
summary_en: "One test at a time: write it, make it pass, repeat — so tests stay honest and behavior-focused."
tags: [skill, tdd, red-green-refactor, integration-test, tracer-bullet, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd
author: mattpocock
license: mattpocock/skills 참조
order: 31
trigger: "tdd / red-green-refactor / test-first / integration test / 테스트 주도 / 테스트 먼저"
install: "npx skills add https://github.com/mattpocock/skills --skill tdd"
---

## 핵심 철학

테스트는 코드 **내부 구현이 아니라 겉으로 드러나는 동작(behavior)을 검증**해야 한다 — 즉 "무엇을 하는가"만 확인한다.
*EN: Test what the code does, not how it does it.*
내부 함수 이름만 바꿔도 테스트가 깨진다면, 그건 동작이 아니라 구현 방식을 테스트한 셈이다. 좋은 테스트는 명세처럼 읽힌다: *"valid cart로 checkout 가능"*.

## Anti-pattern: Horizontal slicing

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  ...
```

테스트를 bulk로 먼저 쓰면 **imagined** behavior를 테스트하게 되고, data shape/function signature만 검증하게 된다. 매 사이클은 직전 사이클에서 배운 것에 반응해야 한다.

## 워크플로우

1. **Planning** — public interface 합의, 우선순위 있는 behavior 리스트, deep module 기회 식별. 사용자 승인.
2. **Tracer bullet** — ONE 테스트가 ONE behavior를 RED → GREEN. End-to-end path가 통하는지 증명.
3. **Incremental loop** — 각 남은 behavior마다 RED → GREEN. **한 번에 하나**, **현재 테스트를 통과시킬 최소 코드만**, 미래 테스트 예측 금지.
4. **Refactor** — 모든 테스트 GREEN인 상태에서만. 중복 추출, 모듈 deepening, SOLID. **RED 상태에서 refactor 금지.**

## 매 사이클 체크리스트

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```

## 원문 SKILL.md (전문)

````markdown
---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

When exploring the codebase, use the project's domain glossary so that test names and interface vocabulary match the project's language, and respect ADRs in the area you're touching.

Before writing any code:

- [ ] Confirm with user what interface changes are needed
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for [deep modules](deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](interface-design.md)
- [ ] List the behaviors to test (not implementation steps)
- [ ] Get user approval on the plan

Ask: "What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
````
