---
title: codebase-memory-mcp
summary: 코드베이스를 로컬 지식 그래프로 인덱싱해 에이전트가 구조 질문을 빠르게 답하게 하는 MCP. 설치 직후 자동 인덱싱은 끄고, .cbmignore와 수동 fast index로 시작한다.
summary_en: Local codebase knowledge graph MCP for coding agents. Disable background auto-index after install; start with .cbmignore and explicit fast indexing.
tags: [mcp, codebase, memory, knowledge-graph, indexing, claude-code, codex, local]
source: https://github.com/DeusData/codebase-memory-mcp
author: DeusData
order: 20
server_name: codebase-memory-mcp
transport: stdio
---

## 무엇을 하는가

코드베이스를 로컬 지식 그래프로 인덱싱해서 에이전트가 “누가 이 함수를 호출하는가”, “이 핸들러가 무엇을 호출하는가”, “영향 범위가 어디인가” 같은 구조 질문을 파일 전체 검색보다 훨씬 적은 토큰으로 답하게 한다.

*EN: Index a local repository into a knowledge graph so coding agents can answer structural questions without reading the whole tree.*

주요 도구:

- `search_graph` — 함수·클래스·라우트·변수 검색
- `trace_path` — 호출자·피호출자 추적
- `get_code_snippet` — 그래프에서 찾은 심볼의 코드 읽기
- `index_repository` / `index_status` — 프로젝트 인덱싱과 상태 확인

## 설치

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash
```

Windows PowerShell:

```powershell
iwr -Uri https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 -OutFile install.ps1
./install.ps1
```

설치 스크립트는 Claude Code, Codex, Gemini 등 감지된 에이전트의 MCP 설정을 자동으로 추가한다. 자동 설정을 건너뛰고 바이너리만 설치하려면 설치 스크립트의 `--skip-config` 옵션을 확인한 뒤 수동 등록한다.

## 설치 직후 안전 기본값

대형 레포나 상위 폴더를 자동 인덱싱하면 백그라운드 watcher가 긴 파싱 작업 중 죽고, 에이전트 쪽에서는 `Transport closed`로 보일 수 있다. 설치 직후에는 자동 인덱싱을 끄고 프로젝트별로 명시적으로 인덱싱한다.

```bash
codebase-memory-mcp config set auto_index false
codebase-memory-mcp config list
```

`auto_index = false`가 보여야 한다.

## 프로젝트마다 먼저 `.cbmignore`

레포 루트에 `.cbmignore`를 먼저 만든 뒤 인덱싱한다. 원칙은 “실제 소스만 남기고, 생성물·캐시·워크트리·에이전트 상태·DB/SQL 덤프는 제외”다.

```text
**/node_modules/
**/dist/
**/build/
**/target/
**/.gradle/
**/.next/
**/.nuxt/
**/.cache/
**/.venv/
**/venv/
worktrees/
**/worktrees/
.agents/
.claude/
.codex/
.gemini/
**/graphify-out/
**/graph.json
**/merged-graph.json
**/*.db
**/*.sqlite
**/dump-*.sql
```

상위 모노레포나 `~/Documents/.../Project` 같은 부모 폴더를 한 번에 인덱싱하지 않는다. 실제 작업 레포 루트에서만 시작한다.

## 수동 인덱싱

먼저 빠른 인덱스로 그래프가 정상 생성되는지 확인한다.

```bash
codebase-memory-mcp cli index_repository '{"repo_path":"'"$PWD"'","mode":"fast"}'
codebase-memory-mcp cli list_projects
codebase-memory-mcp cli index_status '{"project":"<project-name>"}'
```

에이전트의 MCP 호출이 닫혀 있으면 현재 세션의 stdio transport가 이미 죽은 상태일 수 있다. 이때는 CLI로 캐시 상태를 확인하고, 에이전트 세션을 재시작한다.

## MCP 설정 예시

자동 설정이 빠진 도구에는 직접 추가한다. `command`는 설치된 바이너리의 실제 경로로 바꾼다.

```json
{
  "mcpServers": {
    "codebase-memory-mcp": {
      "command": "/Users/you/.local/bin/codebase-memory-mcp",
      "args": []
    }
  }
}
```

stdio MCP는 터미널에서 직접 실행하면 입력 대기 상태처럼 보이는 것이 정상이다. 동작 확인은 에이전트의 MCP 목록 또는 `codebase-memory-mcp cli ...` 명령으로 한다.

## `Transport closed` RCA 체크리스트

- `codebase-memory-mcp config list`에서 `auto_index = false`인지 확인
- `.cbmignore` 없이 부모 폴더나 생성물 폴더를 인덱싱했는지 확인
- macOS라면 `~/Library/Logs/DiagnosticReports/codebase-memory-mcp-*.ips`에서 crash log 확인
- `codebase-memory-mcp cli list_projects`와 `index_status`로 캐시가 정상인지 확인
- 그래프는 정상인데 MCP만 닫히면 에이전트 세션을 재시작

## 운영 원칙

- 설치는 전역으로 한 번, 인덱싱은 프로젝트별로 수동 실행
- 큰 구조 변경 뒤에는 같은 레포 루트에서 다시 `index_repository`
- 검색은 MCP 그래프 도구 우선, 문자열·설정·문서 검색은 일반 파일 검색 사용
- 반복 실패 시 “성공처럼 숨기기”보다 `.cbmignore`, 인덱싱 범위, crash log를 먼저 본다
