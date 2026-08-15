---
title: gws (Google Workspace CLI)
summary: "Drive·Gmail·캘린더·시트·문서·챗·관리콘솔을 명령어 하나로 다루는 CLI. 응답이 전부 JSON이라 에이전트가 그대로 받아 쓰고, 서비스별 스킬 100여 종이 같이 딸려 온다."
summary_en: "One CLI for Drive, Gmail, Calendar, Sheets, Docs, Chat, and Admin. Every response is JSON, and 100+ agent skills ship with it."
tags: [tool, google-workspace, gmail, drive, calendar, cli, agent-skills, rust]
source: https://github.com/googleworkspace/cli
author: googleworkspace
license: Apache-2.0
languages: [Rust]
platforms: [macOS, Linux, Windows]
order: 17
install: "brew install googleworkspace-cli"
---

## 한 줄

Workspace API를 `curl`로 두드리는 대신, **에이전트가 바로 호출할 수 있는 CLI 한 개**로 정리한 도구. 명령어 목록이 코드에 박혀 있지 않고 구글 Discovery Service(구글이 공개하는 API 명세 서비스)를 실행 시점에 읽어 만들어진다.

*EN: One CLI instead of hand-rolled REST calls — and its command tree is generated at runtime from Google's own API catalog.*

## 언제 쓰는가

- 에이전트에게 "받은 메일 정리해서 요약해 줘", "이번 주 일정 뽑아 줘" 같은 Workspace 작업을 시킬 때
- 시트·문서를 스크립트로 만들고 채워야 할 때 (Apps Script 없이)
- CI에서 서비스 계정으로 Drive 업로드나 리포트 생성을 돌려야 할 때
- 관리콘솔(Admin) 작업을 반복해야 할 때

## 무엇을 하는가

- **Discovery 기반 자동 명령어** — 구글이 API 메서드를 추가하면 `gws`도 그날부터 지원한다. 캐시는 24시간.
- **전부 구조화된 JSON 출력** — 에이전트가 파싱할 필요 없이 그대로 소비한다. `--page-all`을 쓰면 페이지네이션(결과를 나눠 주는 방식)을 자동으로 돌며 NDJSON(한 줄에 JSON 하나)으로 흘려 준다.
- **`+` 헬퍼 명령** — 자동 생성 메서드와 구분되도록 `+` 접두사가 붙는 손수 만든 명령. `gmail +send`, `+triage`, `calendar +agenda`, `workflow +standup-report`, `+weekly-digest`, `+meeting-prep` 등. 시간 관련 헬퍼는 캘린더 설정에서 계정 타임존을 읽어 쓴다.
- **스킬 100여 종** — API별 `SKILL.md` + Gmail·Drive·Docs·Calendar·Sheets 레시피 50개. `npx skills add`로 통째로 설치하거나 필요한 것만 고른다. Gemini CLI 확장도 있다.
- **인증 4갈래** — 대화형 OAuth, 서비스 계정, 미리 받은 토큰, CI용 자격증명 내보내기. 자격증명은 AES-256-GCM으로 암호화하고 키는 OS 키체인에 둔다.
- **`--sanitize`** — Model Armor로 응답에 섞인 프롬프트 인젝션(모델을 속이는 문구)을 검사한다. 메일 본문을 에이전트에 먹일 때 쓸모 있다.

## 설치와 사용

```bash
# 설치 (택 1)
brew install googleworkspace-cli                              # macOS / Linux
npm install -g @googleworkspace/cli                           # Node 18+ — 릴리스 바이너리를 내려받는다
cargo install --git https://github.com/googleworkspace/cli --locked
nix run github:googleworkspace/cli
# 또는 https://github.com/googleworkspace/cli/releases 에서 바이너리 직접 내려받아 $PATH에 두기

# 인증
gws auth setup     # Google Cloud 프로젝트 설정을 대화형으로 안내
gws auth login     # 이후 OAuth 로그인

# 기본 사용
gws drive files list --params '{"pageSize": 10}'
gws sheets spreadsheets create --json '{"properties": {"title": "Q1 Budget"}}'
gws gmail +send --to alice@example.com --subject "Hello" --body "Hi there"
gws calendar +agenda --today --timezone America/New_York

# 요청을 보내기 전에 미리보기
gws chat spaces messages create \
  --params '{"parent": "spaces/xyz"}' \
  --json '{"text": "Deploy complete."}' \
  --dry-run

# 메서드의 요청/응답 스키마 확인
gws schema drive.files.list

# 전체 페이지를 NDJSON으로 흘려보내기
gws drive files list --params '{"pageSize": 100}' --page-all | jq -r '.files[].name'

# 에이전트 스킬 설치
npx skills add https://github.com/googleworkspace/cli
npx skills add https://github.com/googleworkspace/cli/tree/main/skills/gws-drive   # 필요한 것만
```

## 함정

- **구글 공식 제품이 아니다.** 저장소가 직접 밝힌다("not an officially supported Google product"). v1.0 이전이라 파괴적 변경(호환이 깨지는 변경)이 예고되어 있다 — CI에 박아 둘 거면 버전을 고정하자.
- **Google Cloud 프로젝트가 먼저 필요하다.** OAuth 자격증명 때문이다. `gws auth setup`이 만들어 주긴 하지만, 조직 계정이면 관리자가 OAuth 클라이언트 생성을 막아 뒀을 수 있다.
- 스킬을 100개 다 깔면 에이전트 컨텍스트를 크게 잡아먹는다. 실제로 쓰는 서비스만 골라 설치하는 편이 낫다.
- 종료 코드가 의미별로 나뉘어 있다(0 성공, 1 API, 2 인증, 3 검증, 4 Discovery, 5 내부). 스크립트에서 `|| true`로 뭉개지 말고 코드로 분기하자.
