---
title: "pi-setup — one-command pi setup"
summary: "pi 코딩 에이전트의 설정 전체(settings·에이전트·스킬·모델 프로파일)를 한 명령으로 복원하는 정본 저장소. 기본 모델은 네이티브 멀티모달 GLM-5.3-Flash이며 별도 비전 확장이 필요 없다."
summary_en: "The canonical dotfiles-style repository for restoring a complete pi setup in one command, with native multimodal GLM-5.3-Flash as the default model."
tags: [pi, config, agent-setup, dotfiles, glm-5.3-flash, multimodal]
source: https://github.com/cskwork/pi-setup
author: cskwork
order: 30
target_file: "~/.pi/agent/ (settings.json · agents/ · skills/ · models.json)"
tools: [Pi]
---

## 한 줄 / 언제 쓰는가

[pi](https://github.com/badlogic/pi-mono) 코딩 에이전트의 개인 설정을 **새 기계에서 한 명령으로 복원**할 때
쓴다. `install.sh`가 저장소를 `~/.pi/agent/`로 심링크(Windows에선 복사)해 준다. 설정 정본은
[`cskwork/pi-setup`](https://github.com/cskwork/pi-setup)이고, 랜딩 페이지는
<https://cskwork.github.io/pi-setup-public/>이다.

## 무엇이 들어 있나

- **settings.json** — 기본 세션과 서브에이전트(부모 세션이 위임해 돌리는 자식 에이전트)를
  `zai/glm-5.3-flash` + thinking `max`로 라우팅한다.
- **models.json** — pi 레지스트리에 아직 없는 `glm-5.3-flash`를 zai 프로바이더에 커스텀 등록한다.
  컨텍스트 100만, zai thinking 포맷, 입력 `text` + `image`를 선언한다.
- **에이전트 프론트매터 함정** — pi-subagents 우선순위는 *프론트매터 `model` > `agentOverrides`*. 죽은
  별칭(예: `sonnet`)을 프론트매터에 남기면 설정이 이기지 못하고 조용히 깨진다.
- **스킬 26종 + 6개 모델 프로파일** — `two-pack`/`four-pack` 게이트 세트 포함.

## 설치와 팁

```bash
git clone https://github.com/cskwork/pi-setup.git ~/pi-setup
~/pi-setup/install.sh
pi auth   # 프로바이더 로그인
# restart pi
```

- 드리프트는 `sync.sh`로 저장소에 커밋·푸시.
- AGENTS.md(에이전트 규칙 파일) 형식에 대해선 [AGENTS.md — Cross-tool spec](/configs/agents-md/) 참고.
