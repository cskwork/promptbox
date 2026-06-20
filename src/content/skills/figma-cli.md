---
title: "figma-cli (figma-ds-cli)"
summary: "AI 에이전트가 Figma Desktop을 직접 제어해 디자인 시스템(design system), 디자인 토큰(design tokens), 컴포넌트를 만드는 CLI. API 키 불필요(No API key required)."
summary_en: "CLI that lets an AI agent build directly in Figma Desktop — components, variables, design tokens, a11y checks — with no API key, no rate limits, and no cloud round-trip."
tags: [figma, design-system, design-tokens, cli, no-api-key, claude-code, cursor, variables]
source: https://github.com/silships/figma-cli
author: "Sil Bormüller"
license: MIT
order: 30
trigger: "figma-cli / create figma variables / build a design system in figma / import design tokens into figma / export figma as DESIGN.md / figma 컴포넌트 생성"
install: "npm install -g figma-ds-cli"
---

## 한 줄

Figma Desktop을 클라우드 API 없이 로컬에서 직접 조종하는 CLI. Claude Code나 Cursor 안에서 평범한 말로 지시하면 ("pricing 카드 5개 만들어줘") 에이전트가 이 CLI를 불러 Figma에 실제 편집 가능한 프레임·컴포넌트·변수를 바로 생성한다.

*EN: Drive Figma Desktop from natural language in Claude Code or Cursor — no API key, no plugin store, no rate limits.*

## 언제 쓰는가

- **Figma API 키·레이트 리밋(rate limit) 회피**: 공식 Figma MCP는 유료 시트 기준 하루 200~600 콜로 제한되며 AI 에이전트는 이를 금방 소진한다. figma-ds-cli는 CDP(Chrome DevTools Protocol)로 로컬 앱에 직접 연결하므로 API 호출이 없고 레이트 리밋도 없다.
- **디자인 토큰(design tokens) 일괄 생성**: Tailwind config, CSS custom properties (`globals.css`), W3C tokens JSON을 읽어 Figma 변수 컬렉션으로 한 번에 변환한다.
- **디자인 시스템(design system) 라운드트립**: `figma-cli extract`로 열린 Figma 파일을 `DESIGN.md`로 내보내고, `figma-cli import`로 다른 파일에 재현한다. 모드(라이트/다크)·별칭(alias)까지 보존된다.
- **오프라인·로컬 LLM 환경**: 인터넷 없이 LM Studio나 Ollama와 함께 완전 로컬로 동작한다.

## 무엇을 하는가 / 함정

주요 서브커맨드:

| 목적 | 커맨드 |
|---|---|
| Figma 연결 (Yolo 모드, 권장) | `figma-cli connect` |
| 안전 모드 연결 (앱 무수정) | `figma-cli connect --safe` |
| JSX로 프레임 렌더 | `figma-cli render '<Frame ...>...</Frame>'` |
| 여러 프레임 배치 렌더 | `figma-cli render-batch '[...]'` |
| shadcn 컴포넌트 추가 | `figma-cli shadcn add button --count 3` |
| 프레임을 컴포넌트로 | `figma-cli node to-component "NODE_ID"` |
| 기존 컴포넌트 인스턴스 삽입 | `figma-cli instantiate "Button"` |
| 컴포넌트 스펙 조회 | `figma-cli spec "Button"` |
| 변수 목록 | `figma-cli var list` |
| shadcn 토큰 프리셋 | `figma-cli tokens preset shadcn` |
| Tailwind 색상 토큰 | `figma-cli tokens tailwind` |
| Tailwind config 임포트 | `figma-cli import tailwind.config.js` |
| CSS 변수 임포트 | `figma-cli import src/globals.css` |
| W3C tokens JSON 임포트 | `figma-cli import tokens.json` |
| 디자인 시스템 내보내기 | `figma-cli extract` |
| 접근성(a11y) 대비 검사 | `figma-cli a11y contrast` |
| PNG/SVG 내보내기 | `figma-cli export png` |
| 이전 작업 되돌리기 | `figma-cli undo` |
| 생성 결과 검증 | `figma-cli verify "NODE_ID"` |

**함정:**
- `eval`은 기존 노드 수정이나 Plugin API 단독 조작에만 쓴다. 새 노드 생성에 쓰면 위치 겹침·안전 장치 우회가 발생한다.
- N개 항목 요청 시 wrapper Frame 하나 안에 묶지 말고 `render-batch`로 독립 노드 N개를 만든다.
- 텍스트가 잘리면 부모 Frame과 모든 `<Text>`에 `w="fill"`을 붙인다.
- 여러 변수 컬렉션이 로드된 경우 `--collection <name>` 플래그로 컬렉션을 명시해야 `var:primary` 같은 바인딩이 올바른 시스템을 참조한다.

````markdown
---
name: figma-cli
description: >
  Use when the user wants to build UI, design systems, or design tokens directly
  in Figma Desktop from an AI agent — without an API key, MCP server, or rate
  limits. Triggers on "figma-cli", "create figma variables", "build a design
  system in figma", "import design tokens into figma", "export figma as
  DESIGN.md", "figma 컴포넌트 생성", or "connect to figma". Requires
  figma-ds-cli installed globally and Figma Desktop running.
argument-hint: "<natural-language design intent or figma-cli subcommand>"
---

# figma-cli

Drive Figma Desktop directly from an AI agent. No API key. No rate limits.
No cloud round-trip. Works with Claude Code and Cursor.

## When to use

- User wants to create frames, components, variants, or a full UI in Figma
- User wants to import design tokens from Tailwind config, CSS, or W3C JSON
- User wants to export a Figma file's design system as DESIGN.md (and re-import it)
- User wants a11y checks (contrast, touch targets, color blindness simulation)
- User explicitly mentions "figma-cli" or "figma-ds-cli"
- User wants to work offline or with a local LLM

## Setup (first time only)

```bash
npm install -g figma-ds-cli   # install the CLI globally
figma-cli connect              # Yolo mode: patches Figma Desktop (reversible)
figma-cli connect --safe       # Safe mode: no patches; keep the FigCli plugin open
```

macOS 13+ permission error: System Settings > Privacy & Security > App Management
> enable your terminal. Or fall back to Safe mode.

## Core commands

### Connect
```bash
figma-cli connect              # recommended, automatic
figma-cli connect --safe       # no modifications to Figma app
```

### Render frames (always use render, not eval, for new nodes)
```bash
# Single frame
figma-cli render '<Frame name="Card" w={320} h={180} bg="var:card" rounded={16} flex="col" gap={8} p={24}>
  <Text size={20} weight="bold" color="var:foreground" w="fill">Title</Text>
  <Text size={14} color="var:muted-foreground" w="fill">Description</Text>
</Frame>'

# Multiple independent frames (N items = N top-level nodes, never one wrapper)
figma-cli render-batch '[
  "<Frame name=\"Card A\" ...>...</Frame>",
  "<Frame name=\"Card B\" ...>...</Frame>"
]' --direction row
```

### shadcn components (40+ ready-made)
```bash
figma-cli shadcn add button            # all button variants
figma-cli shadcn add button --count 3  # 3 distinct button designs
figma-cli shadcn add card --count 5    # 5 distinct card designs
```

### Design tokens & variables
```bash
figma-cli tokens preset shadcn         # 244 primitives + 32 semantic (Light/Dark)
figma-cli tokens tailwind              # 242 Tailwind primitive colors
figma-cli var list                     # list all variables
figma-cli var visualize                # show palette on canvas
figma-cli var delete-all               # delete all variables
```

### Import from code sources
```bash
figma-cli import tailwind.config.js    # Tailwind colors, radii, spacing, fonts
figma-cli import src/globals.css       # CSS custom properties (shadcn HSL, oklch)
figma-cli import tokens.json           # W3C / Style Dictionary design tokens
figma-cli import http://localhost:6006  # Storybook component names + variants
```

### Export design system
```bash
figma-cli extract                      # export open file → DESIGN.md (all pages)
figma-cli extract --pages "Button"     # specific pages only
figma-cli extract --sections tokens    # tokens section only
figma-cli extract --selection          # selected nodes only
figma-cli export png                   # export as PNG
figma-cli export svg                   # export as SVG
figma-cli export dtcg tokens.json      # export tokens as W3C design-tokens JSON
figma-cli export css                   # export as CSS variables
figma-cli export tailwind              # export as Tailwind config
```

### Components & variants
```bash
figma-cli node to-component "NODE_ID"             # frame → component
figma-cli spec "Button"                           # show variant axes + reuse handle
figma-cli instantiate "Button"                    # drop real instance (don't rebuild)
figma-cli variants from 1:2,1:3,1:4 \
  --property Size --values Small,Medium,Large \
  --name Button                                   # frames → component set
```

### Accessibility
```bash
figma-cli a11y contrast                # WCAG contrast check
figma-cli a11y touch                   # touch-target sizing
figma-cli a11y text                    # text size check
figma-cli a11y vision                  # color-blindness simulation
figma-cli a11y audit                   # full audit
```

### Verify & undo
```bash
figma-cli verify "NODE_ID"             # screenshot + dimensions
figma-cli verify "NODE_ID" --measure   # + real w/h of children (catch size bugs)
figma-cli undo                         # remove last creation
```

### Utility
```bash
figma-cli canvas info                  # what's on canvas
figma-cli find "Button"                # find nodes by name
figma-cli blocks list                  # list pre-built layout blocks
figma-cli blocks create dashboard-01   # create full analytics dashboard
figma-cli daemon status                # check daemon
figma-cli daemon restart               # restart daemon
```

## Variable binding (var: syntax)

Bind design tokens at creation time inside JSX:

```jsx
<Frame bg="var:card" stroke="var:border" rounded={12} p={24} flex="col" gap={8}>
  <Text color="var:foreground" size={18} weight="semibold" w="fill">Heading</Text>
  <Text color="var:muted-foreground" size={14} w="fill">Body copy wraps correctly.</Text>
</Frame>
```

When multiple collections are loaded, pin to one with `--collection <name>`:
```bash
figma-cli render-batch '[...]' --collection airbnb
```

## Critical rules

1. Always use `render` / `render-batch` for new visual nodes — never `eval`.
2. N items requested = N independent top-level nodes via `render-batch`, not one
   wrapper Frame containing N children.
3. Add `w="fill"` to the parent Frame AND every `<Text>` to prevent text clipping.
4. After creation, always run `figma-cli verify "NODE_ID"` to confirm output.
5. When a component already exists in an extracted DESIGN.md, use
   `figma-cli instantiate "Name"` — never rebuild from scratch.
6. Never show raw terminal commands to users; run silently and give friendly output.
````
