---
title: find-skills
summary: "\"이거 어떻게 해?\"라고 물으면, 직접 만드는 대신 이미 나와 있는 에이전트 추가 기능(스킬)이 있는지 먼저 찾아보고 설치 수·출처가 믿을 만한지 확인한 뒤 추천·설치해 준다."
summary_en: "Before building from scratch, searches for an existing skill that already does the job, vets it by popularity and source, then offers to install it."
tags: [skill, skills-cli, discovery, vercel-labs, npx-skills, package-manager]
source: https://github.com/vercel-labs/skills/tree/main/skills/find-skills
author: vercel-labs
license: vercel-labs/skills 참조
order: 30
trigger: "how do I do X / find a skill for X / is there a skill that can... / 에이전트 능력 확장 / 도메인 X에 도움 필요"
install: "npx skills add https://github.com/vercel-labs/skills --skill find-skills"
---

## 한 줄

`npx skills`가 에이전트 스킬 생태계의 **패키지 매니저**라는 가정에서, 사용자가 막연히 "X 하는 법" 물어볼 때 이미 설치 가능한 스킬이 있는지 먼저 찾고 검증해서 추천한다.

## 언제 쓰는가

- "어떻게 X 해?" — X가 흔한 작업이라 스킬이 있을 법할 때
- "X 하는 스킬 있어?" / "이거 할 수 있어?"
- 디자인·테스트·배포 같은 도메인 한정 도움이 필요할 때

## 6단계 워크플로우

1. **도메인·작업·일반성** 식별
2. **리더보드 먼저 확인** — [skills.sh](https://skills.sh/) 설치 수 기준
3. `npx skills find <query>` 실행 (구체적 키워드)
4. **품질 검증**: install count(설치 횟수) 1K+ 선호, 100 미만은 조심. `vercel-labs`, `anthropics`, `microsoft` 등 공식 source(출처) 우선. <100 stars(GitHub 별점) repo는 회의적으로
5. **옵션 제시**: 이름 + 동작 + install count + source + 설치 명령 + skills.sh 링크
6. 동의하면 `npx skills add <owner/repo@skill> -g -y`로 설치

## 함정

검색 결과만 보고 추천하지 말 것 — install count, repo 신뢰도까지 확인하라는 게 핵심. 매칭이 없으면 솔직히 "없음" 인정하고 직접 도와주거나 `npx skills init`으로 자체 스킬 작성 제안.

## 원문 SKILL.md

````markdown
---
name: find-skills
description: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.
---

# Find Skills

This skill helps you discover and install skills from the open agent skills ecosystem.

## When to Use This Skill

Use this skill when the user:

- Asks "how do I do X" where X might be a common task with an existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Expresses interest in extending agent capabilities
- Wants to search for tools, templates, or workflows
- Mentions they wish they had help with a specific domain (design, testing, deployment, etc.)

## What is the Skills CLI?

The Skills CLI (`npx skills`) is the package manager for the open agent skills ecosystem.

**Key commands:**

- `npx skills find [query]` - Search for skills interactively or by keyword
- `npx skills add <package>` - Install a skill from GitHub or other sources
- `npx skills check` - Check for skill updates
- `npx skills update` - Update all installed skills

Browse skills at https://skills.sh/

## How to Help Users Find Skills

### Step 1: Understand What They Need

Identify the domain, the specific task, and whether a skill likely exists.

### Step 2: Check the Leaderboard First

Check the skills.sh leaderboard before running a CLI search. The leaderboard ranks skills by total installs.

### Step 3: Search for Skills

```bash
npx skills find [query]
```

- User asks "how do I make my React app faster?" → `npx skills find react performance`
- User asks "can you help me with PR reviews?" → `npx skills find pr review`

### Step 4: Verify Quality Before Recommending

**Do not recommend a skill based solely on search results.** Always verify:

1. **Install count** — Prefer skills with 1K+ installs. Be cautious with anything under 100.
2. **Source reputation** — Official sources (`vercel-labs`, `anthropics`, `microsoft`) are more trustworthy than unknown authors.
3. **GitHub stars** — A skill from a repo with <100 stars should be treated with skepticism.

### Step 5: Present Options to the User

Show name, what it does, install count, source, install command, and skills.sh link.

### Step 6: Offer to Install

```bash
npx skills add <owner/repo@skill> -g -y
```

`-g` installs globally (user-level), `-y` skips confirmation prompts.

## When No Skills Are Found

1. Acknowledge that no existing skill was found
2. Offer to help directly using general capabilities
3. Suggest creating their own with `npx skills init my-xyz-skill`
````
