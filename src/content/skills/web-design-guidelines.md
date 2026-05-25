---
title: web-design-guidelines
summary: Vercel의 Web Interface Guidelines를 매 review마다 WebFetch로 fresh하게 가져와, 지정된 파일을 그 규칙에 비춰 검사하고 `file:line` 형식으로 위반 사항을 리포트하는 스킬.
tags: [skill, vercel, audit, accessibility, ux, web-interface-guidelines]
source: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
author: vercel-labs (vercel)
license: vercel-labs/agent-skills 참조
order: 40
trigger: "review my UI / check accessibility / audit design / review UX / check my site against best practices"
install: "npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines"
---

## 한 줄

review 시점에 항상 `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`를 WebFetch로 가져와서 — 룰이 burned-in되지 않으니 update 따로 안 해도 됨.

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
