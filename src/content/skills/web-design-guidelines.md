---
title: web-design-guidelines
summary: "내 웹사이트 코드를 Vercel의 웹 디자인 기준(접근성·UX 모범 사례)에 비춰 검사하고, 고쳐야 할 곳을 파일·줄 번호로 짚어 주는 스킬. 검사할 때마다 최신 규칙을 자동으로 받아 와 따로 업데이트할 필요가 없다."
summary_en: "Audits UI code against Vercel's design and accessibility guidelines; reports each issue by file and line."
tags: [skill, vercel, audit, accessibility, ux, web-interface-guidelines]
source: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
author: vercel-labs (vercel)
license: vercel-labs/agent-skills 참조
order: 40
trigger: "review my UI / check accessibility / audit design / review UX / check my site against best practices"
install: "npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines"
---

## 한 줄

검사할 때마다 `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`에서 규칙을 새로 받아 온다 — 규칙이 스킬 안에 박혀 있지 않으니 따로 업데이트할 필요가 없다.

*EN: Rules are fetched fresh on every run, not baked in, so they never go out of date.*

## 언제 쓰는가

- "내 UI 검토해줘", "접근성 체크", "디자인 audit", "UX review"
- "best practices에 맞는지 확인"

## 동작

1. 위 URL에서 최신 가이드라인 fetch
2. 사용자가 지정한 파일/패턴 read (없으면 물어봄)
3. 모든 룰 적용
4. 결과를 `file:line` 짧은 형식으로 출력 (수정 빠르게 할 수 있게)

## 함정

파일을 안 알려주면 그냥 멈춰서 묻는다. 자동으로 전체 repo를 스캔하지 않음.

## 원문 SKILL.md

````markdown
---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:
1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
````
