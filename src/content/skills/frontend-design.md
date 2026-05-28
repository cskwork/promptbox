---
title: frontend-design
summary: 'AI가 만든 티 나는 밋밋한 화면 대신, 뚜렷한 디자인 방향을 먼저 정하고 실제 동작하는 세련된 웹 화면 코드로 만들어 주는 Anthropic 공식 디자인 스킬.'
summary_en: 'Builds polished, production-ready web UIs with a distinct design direction — no generic AI look.'
tags: [skill, frontend, design, anthropic, html, css, react, motion]
source: https://github.com/anthropics/skills/tree/main/skills/frontend-design
author: anthropics
license: Anthropic skills LICENSE.txt 참조
order: 35
trigger: "랜딩 페이지 만들기 / 컴포넌트 디자인 / 대시보드·아티팩트·포스터·React 컴포넌트 / 웹 UI 스타일링·beautify"
install: "npx skills add https://github.com/anthropics/skills --skill frontend-design"
---

## 한 줄

코드 짜기 전에 **purpose · tone · constraints · differentiation**부터 결정. brutally minimal부터 maximalist chaos까지 극단을 고르고, 그 방향에 맞게 typography · color · motion · spatial · backgrounds 다섯 축을 의도적으로 구성.

## 절대 쓰지 말 것

- 평범한 폰트 (Inter, Roboto, Arial, system fonts)
- 흰 배경에 보라색 그라데이션 같은 cliché 색상
- 예측가능한 레이아웃과 cookie-cutter 컴포넌트 패턴
- 생성마다 같은 선택으로 수렴 (예: Space Grotesk만 계속 쓰기)

## 함정

미학과 코드 복잡도를 맞춰야 한다 — maximalist는 풍부한 애니메이션, minimalist는 절제된 spacing/typography. 의도가 명확하면 둘 다 작동한다.

## 원문 SKILL.md

````markdown
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
````
