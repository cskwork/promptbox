---
title: codebase-design
summary: "모듈을 '깊게' 설계하기 위한 공용 어휘집 — 작은 인터페이스 뒤에 많은 동작을 감추고, 이음새를 제대로 놓고, 그 인터페이스로 테스트한다. module·interface·depth·seam·adapter 같은 말을 정확히 한 뜻으로 쓰게 만든다."
summary_en: "Shared vocabulary for designing deep modules — a lot of behaviour behind a small interface, placed at a clean seam, tested through that interface."
tags: [skill, design, module, interface, seam, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/codebase-design
author: mattpocock
license: mattpocock/skills 참조
order: 27
trigger: "모듈 인터페이스 설계 / deep module / seam 어디에 둘까 / 테스트하기 좋게 만들기 / design it twice"
install: "npx skills add https://github.com/mattpocock/skills --skill codebase-design"
---

## 한 줄

**deep module(깊은 모듈) = 작은 interface + 많은 implementation.** 호출자에겐 leverage(적게 배우고 많이 쓰는 이득), 유지보수자에겐 locality(변경·버그·검증이 한 곳에 모임), 모두에겐 testability를 준다.

*EN: A lot of behaviour behind a small interface, placed at a clean seam, testable through that interface.*

## 언제 쓰는가

- 모듈의 인터페이스를 새로 짜거나 고칠 때
- seam(이음새 — 그 자리를 고치지 않고도 동작을 바꿔 끼울 수 있는 지점)을 어디에 둘지 정할 때
- 코드를 테스트하기 좋게 / 에이전트가 돌아다니기 좋게 만들 때
- `/to-spec`, `/improve-codebase-architecture` 같은 다른 스킬이 이 어휘를 필요로 할 때

> 업스트림의 별도 스킬이던 `design-an-interface`는 이 스킬에 흡수됐습니다. 서브에이전트를 병렬로 띄워 완전히 다른 설계안들을 만들어 비교하는 "design it twice" 기법은 같은 폴더의 `DESIGN-IT-TWICE.md`로 들어 있습니다.

## 용어를 정확히

이 어휘를 **그대로** 쓴다 — "component", "service", "API", "boundary"로 바꿔 부르지 않는다. 말을 통일하는 것 자체가 목적이다.

| 용어 | 뜻 | 피할 말 |
|---|---|---|
| **Module** | 인터페이스와 구현을 가진 무엇이든. 함수·클래스·패키지·계층을 가로지르는 조각 모두 — 규모를 일부러 안 따진다 | unit, component, service |
| **Interface** | 호출자가 올바로 쓰기 위해 알아야 하는 **전부** — 타입 시그니처만이 아니라 불변식, 호출 순서 제약, 오류 양상, 필요한 설정, 성능 특성까지 | API, signature (너무 좁음) |
| **Depth** | 인터페이스에서 나오는 leverage — 배워야 하는 인터페이스 한 단위당 쓸 수 있는 동작의 양 | — |
| **Seam** (Michael Feathers) | 그 자리를 편집하지 않고 동작을 바꿔 끼울 수 있는 지점. 인터페이스가 **놓이는 위치** | boundary (DDD의 bounded context와 겹침) |
| **Adapter** | seam에서 인터페이스를 만족시키는 구체물. **역할**을 가리키지 내용물을 가리키지 않는다 | — |

## 원칙

- **depth는 인터페이스의 성질이지 구현의 성질이 아니다.** 깊은 모듈 안이 작고 갈아 끼울 수 있는 조각들로 구성돼 있어도 된다 — 그것들이 인터페이스에 없기만 하면.
- **deletion test(삭제 테스트).** 이 모듈을 지운다고 상상해 보라. 복잡도가 사라지면 그건 그냥 통과 지점(pass-through)이었다. 복잡도가 N개 호출자에 되살아나면 값을 하고 있던 것이다.
- **인터페이스가 곧 테스트 표면.** 인터페이스 *너머*를 테스트하고 싶어진다면 모듈 모양이 잘못됐을 가능성이 크다.
- **adapter가 하나면 가상의 seam, 둘이면 진짜 seam.** 실제로 무언가 변하지 않는 자리에 seam을 만들지 않는다.

## 함정

- **Ousterhout의 "구현 줄 수 ÷ 인터페이스 줄 수" 정의는 기각됐다** — 구현을 부풀리면 점수가 오르기 때문. 여기서는 depth를 leverage로 정의한다.
- **"interface"를 TypeScript의 `interface` 키워드나 클래스의 public 메서드로 좁히지 않는다.**
- 더 들어가려면 같은 폴더의 `DEEPENING.md`(의존성 분류·seam 규율·replace-don't-layer 테스팅)와 `DESIGN-IT-TWICE.md` 참조 — 아래 원문에는 포함되지 않는다.

## 원문 SKILL.md (전문)

````markdown
---
name: codebase-design
description: Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
---

# Codebase Design

Design **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface. Use this language and these principles wherever code is being designed or restructured. The aim is leverage for callers, locality for maintainers, and testability for everyone.

## Glossary

Use these terms exactly — don't substitute "component," "service," "API," or "boundary." Consistent language is the whole point.

**Module** — anything with an interface and an implementation. Deliberately scale-agnostic: a function, class, package, or tier-spanning slice. _Avoid_: unit, component, service.

**Interface** — everything a caller must know to use the module correctly: the type signature, but also invariants, ordering constraints, error modes, required configuration, and performance characteristics. _Avoid_: API, signature (too narrow — they refer only to the type-level surface).

**Implementation** — what's inside a module, its body of code. Distinct from **Adapter**: a thing can be a small adapter with a large implementation (a Postgres repo) or a large adapter with a small implementation (an in-memory fake). Reach for "adapter" when the seam is the topic; "implementation" otherwise.

**Depth** — leverage at the interface: the amount of behaviour a caller (or test) can exercise per unit of interface they have to learn. A module is **deep** when a large amount of behaviour sits behind a small interface, **shallow** when the interface is nearly as complex as the implementation.

**Seam** _(Michael Feathers)_ — a place where you can alter behaviour without editing in that place; the *location* at which a module's interface lives. Where to put the seam is its own design decision, distinct from what goes behind it. _Avoid_: boundary (overloaded with DDD's bounded context).

**Adapter** — a concrete thing that satisfies an interface at a seam. Describes *role* (what slot it fills), not substance (what's inside).

**Leverage** — what callers get from depth: more capability per unit of interface they learn. One implementation pays back across N call sites and M tests.

**Locality** — what maintainers get from depth: change, bugs, knowledge, and verification concentrate in one place rather than spreading across callers. Fix once, fixed everywhere.

## Deep vs shallow

**Deep module** = small interface + lots of implementation:

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**Shallow module** = large interface + little implementation (avoid):

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

When designing an interface, ask:

- Can I reduce the number of methods?
- Can I simplify the parameters?
- Can I hide more complexity inside?

## Principles

- **Depth is a property of the interface, not the implementation.** A deep module can be internally composed of small, mockable, swappable parts — they just aren't part of the interface. A module can have **internal seams** (private to its implementation, used by its own tests) as well as the **external seam** at its interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. If you want to test *past* the interface, the module is probably the wrong shape.
- **One adapter means a hypothetical seam. Two adapters means a real one.** Don't introduce a seam unless something actually varies across it.

## Designing for testability

Good interfaces make testing natural:

1. **Accept dependencies, don't create them.**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **Return results, don't produce side effects.**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **Small surface area.** Fewer methods = fewer tests needed. Fewer params = simpler test setup.

## Relationships

- A **Module** has exactly one **Interface** (the surface it presents to callers and tests).
- **Depth** is a property of a **Module**, measured against its **Interface**.
- A **Seam** is where a **Module**'s **Interface** lives.
- An **Adapter** sits at a **Seam** and satisfies the **Interface**.
- **Depth** produces **Leverage** for callers and **Locality** for maintainers.

## Rejected framings

- **Depth as ratio of implementation-lines to interface-lines** (Ousterhout): rewards padding the implementation. We use depth-as-leverage instead.
- **"Interface" as the TypeScript `interface` keyword or a class's public methods**: too narrow — interface here includes every fact a caller must know.
- **"Boundary"**: overloaded with DDD's bounded context. Say **seam** or **interface**.

## Going deeper

- **Deepening a cluster given its dependencies** — see [DEEPENING.md](DEEPENING.md): dependency categories, seam discipline, and replace-don't-layer testing.
- **Exploring alternative interfaces** — see [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md): spin up parallel sub-agents to design the interface several radically different ways, then compare on depth, locality, and seam placement.
````
