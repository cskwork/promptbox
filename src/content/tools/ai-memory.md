---
title: ai-memory
summary: 설치된 모든 코딩 에이전트가 하나의 로컬 서버를 공유하는 크로스 하네스 영속 메모리. FTS5 SQLite + 마크다운 위키로 임베딩 없이 동작하고, 세션 종료 시 훅이 자동으로 기억을 남긴다.
summary_en: One local memory server every coding agent shares. FTS5 SQLite plus a markdown wiki, no embeddings required, with lifecycle hooks that capture each session automatically.
tags: [tool, memory, mcp, cross-agent, sqlite, fts5, hooks, claude-code, codex, opencode, rust, local]
source: https://github.com/akitaonrails/ai-memory
author: akitaonrails
license: MIT
order: 15
languages: [Rust]
platforms: [macOS, Linux, WSL2, Windows]
install: "curl -fsSL -O https://github.com/akitaonrails/ai-memory/releases/latest/download/ai-memory-macos-aarch64.tar.gz"
---

## 한 줄

Claude Code에서 알아낸 것을 Codex와 OpenCode도 그대로 이어받게 만드는, 머신에 하나만 띄우는 공용 메모리 서버.

*EN: A single local server so what one agent learns, every other agent already knows.*

## 언제 쓰는가

에이전트를 두 개 이상 번갈아 쓰는데 매번 같은 맥락을 다시 설명하고 있을 때. 하네스(harness, 에이전트를 실행하는 런타임)마다 메모리가 따로 놀면 "어제 Claude한테 말한 걸 오늘 Codex가 모른다"가 반복된다. ai-memory는 서버 하나를 두고 20여 개 클라이언트를 거기에 붙인다.

## 무엇을 하는가

- **MCP 서버** — `http://127.0.0.1:49374/mcp` 하나로 `memory_query`, `memory_write`, `memory_handoff_accept` 같은 도구를 전 하네스에 노출한다.
- **라이프사이클 훅** — session-start / post-tool-use / session-end를 잡아 세션을 자동 기록한다. 사람이 "이거 기억해"라고 말하지 않아도 쌓인다.
- **두 겹 저장소** — FTS5(SQLite 전문 검색) 인덱스 + 사람이 직접 읽고 고칠 수 있는 마크다운 위키. 검색은 FTS5 + 엔티티 + 그래프 이웃(graph-neighbor, 연결된 항목까지 함께 끌어오기)을 RRF로 합친다.
- **핸드오프(handoff, 이전 세션 요약 인계)** — 새 세션 시작 시 직전 세션의 요약을 주입한다.

임베딩(embedding, 의미 벡터)이나 로컬 LLM은 **선택**이다. 기본 티어는 LLM 0개로 동작한다.

## 함정

- **포트 49374는 macOS ephemeral 범위(49152–65535) 안이다.** 다른 프로세스가 먼저 잡으면 서버가 못 뜬다. 실제로 `opencode2 serve --service`가 이 포트를 가져가는 사례가 있다. 충돌 시 `bind`/`server_url`을 39374처럼 범위 밖 포트로 옮기면 재발하지 않는다.
- **LLM provider를 설정해 놓고 토큰이 없으면 서버가 아예 기동을 거부한다.** `provider not configured`로 죽으므로, provider를 켜기 전에 `ai-memory auth login`을 먼저 끝낸다.
- **`--project-strategy repo-root`를 빼먹지 말 것.** 기본값 `basename`은 세션 도중 `cd sub` 한 번에 `sub`라는 유령 프로젝트를 만들어 기억을 쪼갠다.
- **`capture_assistant`는 이중 opt-in이고 기본 off다.** 어시스턴트 최종 답변에는 코드·비밀이 섞일 수 있고 그대로 클라우드 LLM 프롬프트로 흘러간다. 필요 없으면 켜지 않는다.
- **`[auto_improve.scheduler]`는 기본 `enabled = true`**라 1시간마다 전 프로젝트를 LLM으로 훑는다. 가볍게 쓰려면 꺼야 한다.
- **Pi는 `mcp.json`이 없다.** `install-mcp --client pi`는 파일을 쓰지 않고 안내만 출력한다. `install-hooks --agent pi`가 생성하는 TypeScript 익스텐션이 MCP 브리지까지 겸한다. Oh My Pi(`omp`)는 별도 식별자다.
- **Hermes는 아직 1st-party 설치기가 없다.** `install-hooks --agent hermes`는 존재하지 않으므로 Hermes 자체 MCP 설정에 HTTP 엔트리를 직접 병합한다.

## macOS 네이티브 설치 (Docker 없이)

```bash
# 1. 릴리스 바이너리 (aarch64 = Apple Silicon, x86_64 = Intel)
mkdir -p ~/Applications/ai-memory && cd ~/Applications/ai-memory
curl -fsSL -O https://github.com/akitaonrails/ai-memory/releases/latest/download/ai-memory-macos-aarch64.tar.gz
curl -fsSL -O https://github.com/akitaonrails/ai-memory/releases/latest/download/ai-memory-macos-aarch64.tar.gz.sha256
shasum -a 256 -c ai-memory-macos-aarch64.tar.gz.sha256
tar -xzf ai-memory-macos-aarch64.tar.gz
ln -sf ~/Applications/ai-memory/ai-memory ~/.local/bin/ai-memory

# 2. 데이터 디렉터리 초기화 (~/Library/Application Support/ai-memory)
ai-memory init

# 3. 서버 기동 (루프백 전용)
ai-memory serve --transport http --bind 127.0.0.1:49374
```

## 임베딩 없는 경량 설정

`<data_dir>/config.toml`. 임베딩·벡터·리랭커 키는 **적지 않는 것**이 곧 비활성화다.

```toml
bind = "127.0.0.1:49374"
server_url = "http://127.0.0.1:49374"
allowed_hosts = ["localhost", "127.0.0.1", "::1"]
log_level = "info"

# ChatGPT/Codex 구독 OAuth. OPENAI_API_KEY를 쓰지 않는다.
# 요약·추출 작업이라 mini급이면 충분하다.
llm_provider = "openai-oauth"
llm_model = "gpt-5-mini"

# 1시간마다 도는 백그라운드 자동 개선 스케줄러를 끈다.
[auto_improve.scheduler]
enabled = false
```

LLM 자체가 필요 없으면 `llm_provider` / `llm_model` 두 줄을 지운다. FTS5 + 엔티티 + 그래프 검색과 규칙 기반 세션 요약은 그대로 동작한다.

```bash
# ChatGPT/Codex 구독으로 로그인 (device code 방식, OPENAI_API_KEY 아님)
ai-memory auth login openai-oauth
ai-memory auth status
```

## 하네스 연결

두 명령이 전부다. `--apply` 없이 실행하면 스니펫만 출력하고 파일은 건드리지 않는다. `--apply`는 idempotent(여러 번 돌려도 결과 동일)하고, 수정 전 타임스탬프 백업을 남기며, 다른 MCP 서버·훅 설정을 보존한다.

```bash
ai-memory install-mcp   --client <client-id> --apply
ai-memory install-hooks --agent  <agent-id>  --project-strategy repo-root --apply
```

| 하네스 | `--client` | `--agent` | 비고 |
|---|---|---|---|
| Claude Code | `claude-code` | `claude-code` | `~/.claude.json` + `~/.claude/settings.json` |
| Codex CLI | `codex` | `codex` | `~/.codex/config.toml` |
| OpenCode | `open-code` (alias `opencode`) | `open-code` | TS 플러그인 생성, 재시작 필요 |
| Cursor | `cursor` | `cursor` | `~/.cursor/mcp.json` + `hooks.json` |
| Gemini CLI | `gemini-cli` | `gemini-cli` | `~/.gemini/settings.json` |
| Antigravity CLI | `antigravity-cli` | `antigravity-cli` | `agy` |
| Pi | (없음) | `pi` | 익스텐션이 MCP까지 겸함 |
| Oh My Pi | `omp` | `omp` | `~/.omp/agent/` |
| Kiro CLI | `kiro-cli` | `kiro-cli` / `kiro-cli-v3` | 엔진 버전에 따라 다름 |
| Grok Build CLI | `grok` | `grok` | SessionStart stdout 무시 |
| Kimi Code | `kimi-code` | `kimi-code` | |
| Command Code | `command-code` | `command-code` | |
| Devin CLI | `devin` | `devin` | |
| OpenClaw | `openclaw` | `openclaw` | |
| Zero | `zero` | `zero` | |
| Zed · VS Code Copilot · Claude Desktop · Swival | 각각 지원 | 없음 | MCP 전용 |

## 1st-party 설치기가 없는 하네스 (예: Hermes)

해당 하네스의 MCP 설정에 HTTP 엔트리를 직접 병합한다. 기존 `mcp_servers` 섹션을 덮어쓰지 않는다.

```yaml
mcp_servers:
  ai-memory:
    url: "http://127.0.0.1:49374/mcp"
    enabled: true
```

훅 라우터는 `agent=hermes`를 정식 세션 종류로 인식하므로, 커스텀 브리지는 `on_session_start` / `post_tool_call` / `on_session_end`를 ai-memory의 `session-start` / `post-tool-use` / `session-end`로 매핑하면 된다.

```bash
curl -X POST \
  'http://127.0.0.1:49374/hook?event=session-start&agent=hermes' \
  -H 'content-type: application/json' \
  -d '{"session_id":"sess-123","cwd":"/repo"}'
```

## 검증

```bash
ai-memory status
lsof -nP -iTCP:49374 -sTCP:LISTEN     # 127.0.0.1 여야 한다. 0.0.0.0이면 안 된다
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:49374/mcp   # 405 = 도달 가능
ps -axo pid,%cpu,rss,command | grep '[a]i-memory'                     # 프로세스는 하나여야 한다
```

에이전트 쪽에서는 "네가 쓸 수 있는 MCP 도구 목록을 보여줘"라고 물어 `memory_*` 도구가 뜨는지 확인한다. 설정 파일에 문자열이 들어갔다는 것만으로 동작을 주장하지 않는다.
