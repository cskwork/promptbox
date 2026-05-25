---
title: Stitch (Google) MCP
summary: Google Stitch의 디자인 생성 기능을 Claude Code/Desktop/Codex에서 MCP 툴로 호출. stitch-landing 스킬이 의존하는 서버.
tags: [mcp, design, stitch, google, landing-page]
source: https://stitch.withgoogle.com
order: 10
server_name: stitch
transport: stdio
---

## 무엇을 하는가

[Google Stitch](https://stitch.withgoogle.com)의 화면 디자인 생성을 MCP 툴로 노출한다. 주요 툴:

- `mcp__stitch__create_project` — 프로젝트 생성
- `mcp__stitch__generate_screen_from_text` — 텍스트 프롬프트 → HTML+CSS 화면
- `mcp__stitch__list_screens` — 프로젝트 내 화면 목록 (생성 중 폴링용)

`stitch-landing` 스킬이 이 MCP에 의존한다.

## Claude Code (`.mcp.json` 또는 `~/.claude.json`)

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@stitch/mcp-server"],
      "env": {}
    }
  }
}
```

> 패키지명/배포 형태는 Stitch가 공식 게시하는 방법에 따라 달라질 수 있다. `https://stitch.withgoogle.com`의 MCP 안내를 따른다.

## Claude Desktop (`claude_desktop_config.json`)

위치: macOS `~/Library/Application Support/Claude/claude_desktop_config.json`, Windows `%APPDATA%/Claude/claude_desktop_config.json`.

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@stitch/mcp-server"]
    }
  }
}
```

설정 후 Claude Desktop을 재시작한다.

## 인증

Stitch는 Google 계정 로그인이 필요하다. MCP 서버 실행 시 브라우저로 OAuth 플로우를 띄우는 방식 또는 사전 발급한 토큰을 env에 주입하는 방식 둘 다 가능 (서버 구현에 따라).

## 호출 패턴

```text
1. mcp__stitch__create_project { title: "My Landing" }
   → { projectId: "..." }

2. mcp__stitch__generate_screen_from_text {
     projectId,
     deviceType: DESKTOP,        // 또는 MOBILE
     modelId: GEMINI_3_FLASH,    // 빠름. 고화질은 GEMINI_3_1_PRO
     prompt: "<디자인 프롬프트>"
   }
   → 첫 호출은 1–3분 소요. 재시도 금지.

3. (필요 시) mcp__stitch__list_screens { projectId }로 폴링
   → htmlCode.downloadUrl + theme.designMd 확보
```

## 자주 하는 실수

- **첫 generation 타임아웃 시 재시도** — 절대 금지. `list_screens` 폴링으로 결과 대기
- **결과 HTML 그대로 출고** — base64 인라인 PNG가 30-70KB 바이트 부풀림. 디자인 토큰만 빼서 production HTML 따로 작성
- **deviceType 누락** — 기본값 없음. DESKTOP/MOBILE 명시 필수
