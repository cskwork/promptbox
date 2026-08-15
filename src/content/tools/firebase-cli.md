---
title: Firebase CLI (firebase-tools)
summary: "Firebase 프로젝트를 터미널에서 초기화·에뮬레이터 실행·배포하는 공식 CLI. 같은 바이너리에 MCP 서버가 들어 있어, 코딩 에이전트가 Firestore·Auth·Crashlytics를 직접 읽고 고칠 수 있다."
summary_en: "The official Firebase CLI for init, local emulators, and deploys — and the same binary ships the Firebase MCP server so agents can touch Firestore, Auth, and Crashlytics directly."
tags: [tool, firebase, mcp, deploy, firestore, emulator, google, cli]
source: https://github.com/firebase/firebase-tools
author: firebase
license: MIT
languages: [TypeScript]
platforms: [macOS, Linux, Windows]
order: 18
install: "npm install -g firebase-tools"
---

## 한 줄

Firebase 프로젝트를 만들고, 로컬 에뮬레이터로 돌려 보고, 배포하는 공식 CLI. 여기에 **`firebase mcp` 한 줄이면 같은 CLI가 MCP 서버(에이전트에 도구를 물려 주는 규격)로 변신한다.**

*EN: The official deploy/emulate CLI, and `firebase mcp` turns the same binary into an MCP server for your agent.*

## 언제 쓰는가

- Firebase Hosting·Functions·Firestore·Storage 규칙을 배포할 때 (`firebase deploy`)
- 배포 전에 로컬 에뮬레이터로 함수·보안 규칙을 검증할 때 (`firebase emulators:start`)
- **에이전트에게 Firestore 문서를 직접 읽히거나, 보안 규칙을 짜게 하거나, Crashlytics 이슈를 물어보게 하고 싶을 때** — 이때가 MCP 서버를 붙이는 지점이다
- CI에서 서비스 계정으로 자동 배포를 돌릴 때

## 무엇을 하는가

CLI 쪽 주요 명령:

| 명령 | 무엇에 쓰나 |
|---|---|
| `firebase login` / `login:add` / `login:use` | 계정 인증, 계정 여러 개 전환 |
| `firebase init` | 현재 디렉터리에 `firebase.json` 등 프로젝트 구성 생성 |
| `firebase use` | 활성 프로젝트 전환, 별칭 관리 |
| `firebase emulators:start` / `emulators:exec` | 로컬 에뮬레이터 실행 / 테스트 스크립트 실행 후 종료 |
| `firebase deploy` | `firebase.json` 기준으로 배포 |
| `firebase apps:create` / `apps:sdkconfig` | 앱 등록, SDK 설정값 출력 |
| `firebase appdistribution:distribute` | 테스터에게 빌드 배포 |

MCP 서버 쪽 기능 그룹: `core`(로그인·프로젝트/앱 생성·규칙 검증), `firestore`(문서 CRUD·쿼리·인덱스), `auth`(사용자 조회·비활성화·커스텀 클레임), `dataconnect`, `crashlytics`(이슈·이벤트·리포트), `apphosting`, `functions`(목록·로그), `realtimedatabase`, `messaging`, `remoteconfig`, `storage`, `developerknowledge`(공식 문서 검색·근거 기반 답변). 슬래시 프롬프트로 `/firebase:init`, `/firebase:deploy`, `firestore:generate_security_rules` 등도 함께 붙는다.

## 설치와 사용

```bash
# CLI 설치 (택 1)
npm install -g firebase-tools          # Node.js + npm 필요
curl -sL firebase.tools | bash         # 의존성 없는 단독 바이너리

firebase login
firebase init
firebase emulators:start
firebase deploy
```

MCP 서버로 붙이기 — Claude Code:

```bash
# 플러그인 경로 (권장)
claude plugin marketplace add firebase/firebase-tools
claude plugin install firebase@firebase

# 또는 MCP 서버로 직접 등록
claude mcp add firebase npx -- -y firebase-tools@latest mcp
claude mcp list
```

그 밖의 MCP 클라이언트(Cursor `.cursor/mcp.json`, Windsurf, Cline, Claude Desktop 등)는 같은 JSON을 쓴다:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "mcp"]
    }
  }
}
```

프로젝트 디렉터리를 고정하고 기능을 좁히려면:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": [
        "-y", "firebase-tools@latest", "mcp",
        "--dir", "/absolute/path/to/project",
        "--only", "auth,firestore,storage"
      ]
    }
  }
}
```

VS Code Copilot은 `.vscode/mcp.json`에 `servers` 키와 `"type": "stdio"`를 쓴다.

현재 버전이 무엇을 노출하는지는 직접 뽑아 보는 편이 정확하다:

```bash
npx firebase-tools@latest mcp --generate-tool-list
npx firebase-tools@latest mcp --generate-prompt-list
npx firebase-tools@latest mcp --generate-resource-list
```

## 함정

- **MCP 서버는 CLI의 인증을 그대로 쓴다.** 즉 에이전트가 `firebase login`한 계정의 권한으로 운영 Firestore를 읽고 쓸 수 있다. 운영 프로젝트에 붙일 거면 `--only`로 기능을 좁히고, 가급적 `firebase use`로 개발 프로젝트를 활성화한 뒤 붙이자.
- **`--dir`를 안 주면** 서버의 현재 작업 디렉터리를 프로젝트로 삼고, 대신 `get_project_directory`/`set_project_directory` 도구가 노출된다. 여러 프로젝트를 오갈 게 아니면 `--dir`로 못 박는 게 안전하다.
- **`firebase login:ci` 토큰은 폐기 예정이다.** 수명 긴 민감한 자격증명이라 향후 메이저 버전에서 제거된다 — CI는 서비스 계정 인증으로 옮기자.
- `npx -y firebase-tools@latest`는 매번 최신을 끌어온다. 재현 가능한 환경이 필요하면 버전을 고정하자.
