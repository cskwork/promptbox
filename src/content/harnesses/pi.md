---
title: pi
summary: "도구 4개(read·write·edit·bash)만 들고 시작해 필요한 기능을 TypeScript 확장·스킬·프롬프트로 직접 조립하는 오픈소스 터미널 코딩 에이전트. 여러 모델 공급자, 세션 트리·압축, 이미지 입력, 커스텀 도구를 지원하며 promptbox의 기본 하네스다."
summary_en: "A deliberately minimal, self-extensible terminal coding agent: start with read, write, edit, and bash, then compose providers, tools, skills, prompts, session handling, and native multimodal input through extensions. The default harness for promptbox."
tags: [harness, pi, coding-agent, terminal, extensible, multi-provider, multimodal, typescript]
source: https://github.com/badlogic/pi-mono
author: Mario Zechner · Earendil Works contributors
license: MIT
order: 1
base_agent: 자체
base_agent_en: Standalone
languages: [TypeScript]
platforms: [macOS, Linux, Windows]
install: "npm install -g --ignore-scripts @earendil-works/pi-coding-agent"
---

## 한 줄

**pi**는 일부러 작게 시작하는 코딩 에이전트다. 기본 도구는 `read`·`write`·`edit`·`bash` 네 개뿐이고,
나머지는 package(확장·스킬·프롬프트 묶음)로 붙인다. 그래서 기능과 시스템 프롬프트를 하네스 내부에서
억지로 우회하지 않고, 사용자가 읽고 바꾸고 뺄 수 있다.

## 무엇을 하는가

- OpenAI·Anthropic·Google·Z.ai 등 여러 공급자를 한 CLI에서 전환한다.
- 대화 세션을 트리로 저장하고, 긴 세션은 압축(compaction, 오래된 대화를 요약해 공간을 되찾는 기능)한다.
- 모델이 `image` 입력을 선언하면 스크린샷과 이미지 파일을 직접 전달한다.
- TypeScript 확장으로 도구·명령·UI·권한·MCP·서브에이전트를 추가한다.
- `AGENTS.md`, `~/.agents/skills/`, 프롬프트 템플릿을 조합해 프로젝트와 사용자 규칙을 분리한다.

## 설치와 시작

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
pi auth
cd ~/my-project
pi
```

promptbox 기본 구성 전체를 복원하려면 [`pi-setup`](/configs/pi-setup/)을 쓴다.

## 함정

- pi 자체에는 파일·프로세스·네트워크 권한 샌드박스가 없다. 기본값은 실행한 사용자 권한과 같다.
  강한 격리가 필요하면 공식 문서의 Docker·OpenShell·Gondolin 패턴을 적용한다.
- 모델 이름이 같아도 `models.json`의 `input` 선언이 `text`뿐이면 pi는 이미지를 보내지 않는다.
  GLM-5.3-Flash는 `['text', 'image']`로 등록해야 네이티브 멀티모달 입력이 열린다.
- 확장은 실제로 실행되는 코드다. 출처와 변경 내용을 읽고 설치한다.
