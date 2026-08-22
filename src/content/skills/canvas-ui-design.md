---
title: canvas-ui-design
summary: "웹사이트 UI를 Canvas UI(WebGL 캔버스 이펙트 33종)로 설계·구현한다. 한 페이지에 지배적인 이펙트 하나만 쓰고, 흔한 AI풍 보라-파랑 그라데이션·글래스 카드·이모지 불릿을 금지하는 규칙이 핵심."
summary_en: "Design site UI with Canvas UI's 33 WebGL effects — one dominant effect per page, and hard rules against the generic AI-generated look."
tags: [skill, ui, design, webgl, canvas-ui, frontend, shader, landing-page]
source: https://github.com/cskwork/canvas-ui-skill
mirror_of: https://raw.githubusercontent.com/cskwork/canvas-ui-skill/main/SKILL.md
author: cskwork
license: MIT
order: 60
trigger: "canvas ui / canvasui.dev / 랜딩 페이지 디자인 / UI 리디자인 / liquid glitch VHS ASCII 파티클 셰이더 이펙트 / 밋밋한 AI풍 디자인 탈출"
install: "npx shadcn@latest add @canvas-ui/liquid-react"
---

## 한 줄

[Canvas UI](https://github.com/DavidHDev/canvas-ui)의 캔버스 이펙트 33종을 **레퍼런스로 삼아** UI를 만들되, "이펙트를 더 많이"라는 본능을 눌러 주는 **디자인 규칙**이 본체다. React·Solid·Preact·Vue·Svelte·vanilla(바닐라 JS)를 지원한다.

*EN: The effect catalog is the easy part; the design rules that stop you overusing it are the point.*

## 언제 쓰는가

- 새 사이트/랜딩을 만들거나 기존 UI를 리디자인할 때
- 결과물이 "AI가 만든 것 같다"는 느낌일 때 — 보라→파랑 그라데이션 히어로, 메시 배경 위 반투명 글래스 카드, 이모지 불릿
- liquid, glass, glitch, VHS, ASCII, 파티클 같은 페이지 단위 이펙트가 필요할 때

## 함정

- **페이지당 지배적 이펙트 하나.** 캔버스 이펙트 네 개를 얹으면 제품이 아니라 데모 릴로 읽힌다.
- **모션은 반응이지 장식이 아니다.** 포인터·스크롤에 연결하라. 입력 없는 앰비언트 루프는 소음이다.
- **기능을 미학과 바꾸지 않는다.** 텍스트 선택, 링크 클릭, 폼 제출, 포커스 링이 깨지면 이펙트가 진다.
- **폴백(fallback, 미지원 시 대체 경로)이 기본 상태다.** html-in-canvas는 Chrome 플래그가 필요하고, 그 외 환경에서는 WebGL 오버레이로 낮아진다. 플래그가 켜진 쪽이 업그레이드다.
- **WebGL 컨텍스트는 페이지당 하나.** 언마운트·라우트 변경 시 `destroy()`를 부르지 않으면 탭이 죽는다.
- **대비는 *렌더된 결과* 기준으로 잰다.** 밑에 깔린 CSS 색이 아니다.
- 라이선스는 MIT + Commons Clause — 내 프로젝트에 상업적으로 써도 되지만 라이브러리 자체를 되팔 수는 없다.

````markdown
---
name: canvas-ui-design
description: Design and build expressive website interfaces with Canvas UI (github.com/DavidHDev/canvas-ui) — 33 canvas-drawn WebGL effects shipped for React, Solid, Preact, Vue, Svelte, and vanilla JS. Use when creating a new website, redesigning an existing one, or refining its UI; when the user asks for a tactile, memorable, non-generic interface; or when they mention Canvas UI, canvasui.dev, or page-level liquid, glass, glitch, VHS, ASCII, particle, or shader effects.
---

# Canvas UI Design

Treat `https://github.com/DavidHDev/canvas-ui` as the primary creative reference for
the UI: install its components and read their source rather than writing your own
shader or canvas code.

Read [REFERENCE.md](REFERENCE.md) before picking an effect, and again before wiring
one up — it carries the full component catalog, the effect-picking table, the
registry naming scheme, and the vanilla factory contract the JSX example below
does not cover.

## Design rules

These override any instinct toward "more effects."

1. **One dominant effect per page.** Pick a single signature effect and let it own the
   hero. Everything else is typography, spacing, and color. A page with four canvas
   effects reads as a demo reel, not a product.
2. **Ship a cohesive site, not a collection of effects.** The effect must serve real
   content — an actual product, an actual argument. If the page has nothing to say,
   the effect makes that louder, not better.
3. **Motion is a response, not decoration.** Canvas UI effects are pointer- and
   scroll-driven. Wire them to something the user did. Ambient loops with no input
   are noise.
4. **Never trade functionality for aesthetics.** Text stays selectable, links stay
   clickable, forms stay submittable, focus rings stay visible. If the effect breaks
   any of these, the effect loses.
5. **Avoid generic AI-generated look.** No purple-to-blue gradient hero, no floating
   glassmorphic cards on a mesh background, no emoji feature bullets. Commit to a
   specific typographic and color point of view.

## Workflow

1. **Read the content first.** Decide what the page is arguing before choosing an
   effect. Effect follows message.
2. **Pick one effect** from the table in [REFERENCE.md](REFERENCE.md), matched to
   tone — fluid/optical for calm and premium, glitch/retro for loud and technical,
   particle/3D for product showcases.
3. **Install it** from the registry (see Install).
4. **Build the page around it.** Layout, type scale, palette, and copy carry the
   design. The effect is the accent that makes it memorable.
5. **Verify the fallback path.** Load the page in a browser without the html-in-canvas
   flag and confirm it still looks intentional (see Browser support).
6. **Clear every guardrail** in the last section before calling it done.

## Install

Canvas UI is copy-in source via a shadcn registry, not an npm dependency:

```bash
npx shadcn@latest init                       # only if the project has no components.json
npx shadcn@latest add @canvas-ui/liquid-react
```

Swap `liquid` for any component in [REFERENCE.md](REFERENCE.md), and `react` for
`solid`, `preact`, `vue`, `svelte`, or `vanilla`. Files land in `components/canvasui/`
(Svelte: `src/lib/components/canvasui/`) and are yours to edit.

Most components wrap content rather than sit beside it:

```jsx
import { Liquid } from "@/components/canvasui/Liquid";

<Liquid intensity={2} distortion={0.4}>
  <Hero />
</Liquid>
```

## Browser support

The html-in-canvas components read the live DOM as a texture. That API needs Chrome
with `chrome://flags/#canvas-draw-element`, or an origin trial token so visitors need
no flag. Everywhere else they degrade to a **WebGL overlay** — the effect renders, but
it no longer distorts the page content. The five 3D object components render fully in
every browser with no flag.

Design for the fallback as the default state. The flagged version is the upgrade.

## Guardrails

- Honor `prefers-reduced-motion` — the components already do; any motion you add
  checks it too.
- Keep the effect off the critical render path so first paint is text, not a blank canvas.
- On the vanilla path call `destroy()` on teardown or route change; the framework
  wrappers already destroy on unmount. Leaked WebGL contexts kill the tab.
- One WebGL context per page. Each additional canvas costs a context and a frame budget.
- Contrast is measured against the *rendered* result, not the CSS color underneath.
- License is MIT + Commons Clause: free to use in your own projects, commercial or not;
  you may not resell the library itself.
````
