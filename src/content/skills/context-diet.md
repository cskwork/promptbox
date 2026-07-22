---
title: context-diet
summary: "Claude Code가 매 요청마다 실어 보내는 시스템 프롬프트 군살(안 쓰는 툴 정의·번들 스킬 목록·기능 안내)을 측정하고 settings.json으로 덜어낸다. 로깅 프록시로 툴별 토큰 크기를 순위로 뽑아 무엇을 끌지 근거를 만든다."
summary_en: "Measure and cut Claude Code's per-request system-prompt bloat — unused tool definitions, the bundled-skills catalogue, feature instructions — via settings.json, with a logging proxy that ranks tools by token size."
tags: [skill, claude-code, tokens, cost, settings, optimization, proxy]
source: https://github.com/cskwork/context-diet-skill
author: cskwork
license: MIT
order: 18
trigger: "토큰 줄여줘 / 컨텍스트 줄이기 / 시스템 프롬프트 다이어트 / disableBundledSkills / permissions.deny"
install: "npx skills add cskwork/context-diet-skill"
---

## 한 줄

매 턴마다 청구되는데 정작 안 쓰는 것들 — 툴 정의, 번들 스킬 카탈로그, 기능 안내문 — 이 수만 토큰이다. 그걸 **재고 측정하고 덜어낸다**.

*EN: Tens of thousands of tokens per turn, billed every turn, that the model reads before reaching your actual problem.*

## 언제 쓰는가

- `/context`를 쳐봤더니 tools·system이 생각보다 크게 잡힐 때
- 요청이 느리고 비싸다고 느껴질 때
- MCP 서버·스킬을 많이 깔아 두고 실제로는 몇 개만 쓸 때

## 무엇을 하는가

핵심은 한 줄로 정리된다.

> `permissions.deny`에 **맨이름**(`"NotebookEdit"`)을 넣으면 툴 **정의 자체가 페이로드에서 빠진다**.
> **스코프 규칙**(`"Skill(dataviz)"`)은 호출만 막고 정의는 그대로 남는다.

토큰을 줄이려면 맨이름으로 deny하고 `disable*` 플래그를 켜야 한다.

```bash
node scripts/apply-config.mjs            # ~/.claude/settings.json (전역)
node scripts/apply-config.mjs --project  # ./.claude/settings.json (이 프로젝트)
node scripts/apply-config.mjs --dry-run  # 미리보기만
```

스크립트는 대상 파일을 **먼저 백업**하고, deny 규칙을 중복 없이 덧붙이며 기존 순서를 보존한다. 이후 Claude Code를 재시작하고 `/context`로 감소분을 확인한다. 보수적으로 가려면 `--template templates/settings.conservative.json`.

**측정** — `/context`는 합계만 준다. 툴별 순위가 필요하면 로깅 프록시를 쓴다.

```bash
node proxy.mjs                                   # :8787
ANTHROPIC_BASE_URL=http://localhost:8787 claude  # 다른 터미널에서
```

요청마다 `./logs/*.md`에 기록되고 툴 크기 순위표가 실시간으로 출력된다. 8787이 이미 쓰이면 `PORT=9000`.

방법론은 aihero.dev의 "How to kill the bloat in Claude Code's system prompt"에서 가져왔다.

## 함정

- **끄면 사라진다.** deny한 툴은 모델이 존재 자체를 모르게 되므로, 나중에 그 기능이 필요해졌을 때 "왜 못 하지"가 된다. 무엇을 껐는지 기록해 두자.
- 프록시는 API 트래픽을 로컬로 흘린다. 사내·민감 환경이라면 로그에 프롬프트 전문이 남는다는 점을 먼저 확인해야 한다.
- `--dry-run`으로 먼저 보고 적용하는 습관을 들이자. 전역 `settings.json`은 모든 프로젝트에 영향을 준다.
