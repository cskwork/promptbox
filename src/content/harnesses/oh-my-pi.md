---
title: omp — oh-my-pi
summary: "코드 편집·검색·디버깅·웹 검색·브라우저 조작까지 AI 코딩 에이전트에 필요한 도구를 하나의 프로그램에 다 넣은 올인원 에이전트. 외부 도구를 따로 깔 필요 없이 macOS·Linux·Windows에서 같은 방식으로 돌고, 40개 넘는 AI 모델을 명령 하나로 바꿔 쓸 수 있다. Cursor·Codex 같은 다른 도구의 설정도 알아서 읽어 온다."
summary_en: "One binary, every OS: a coding agent with editing, debugging, and web search built in, plus 40+ AI models switchable with one command."
tags: [harness, omp, pi, coding-agent, lsp, dap, rust, multi-provider, acp, zed, terminal]
source: https://github.com/can1357/oh-my-pi
author: Can Bölük (can1357), based on Pi by Mario Zechner
license: MIT
order: 30
base_agent: 자체 (Pi fork)
languages: [TypeScript, Rust, Bun]
platforms: [macOS, Linux, Windows, Zed (ACP)]
install: "curl -fsSL https://omp.sh/install | sh   # 또는 bun install -g @oh-my-pi/pi-coding-agent"
---

## 한 줄

"꺼내자마자 완성돼 있고, 끝까지 열려 있다." 코드 분석·디버거·검색 같은 무거운 도구까지 전부 프로그램 안에 넣어 외부 실행 없이 동작 — Windows 포함 모든 OS에서 같은 실행 파일 하나로.
*EN: Complete out of the box, open all the way down — one binary, every OS.*

## 설치

```bash
# macOS / Linux
curl -fsSL https://omp.sh/install | sh

# Bun (recommended)
bun install -g @oh-my-pi/pi-coding-agent

# Windows (PowerShell)
irm https://omp.sh/install.ps1 | iex

# Pinned versions (mise)
mise use -g github:can1357/oh-my-pi
```

요구: bun ≥ 1.3.14. macOS · Linux · Windows.

## 18가지 핵심 특성 (요약)

1. **Code execution w/ tool-calling** — Python + Bun worker가 loopback bridge로 에이전트 tool(`read`/`search`/`task`) 재호출. cell 안 떠나고 CSV→chart 끝
2. **LSP wired into every write** — rename은 `workspace/willRenameFiles` 경유. re-export / barrel / aliased import 파일 이동 전에 업데이트
3. **Real debugger drive** — C는 lldb, Go는 dlv, Python은 debugpy. attach → step → frame inspect
4. **Time-traveling stream rules** — regex 매치 시 stream을 mid-token abort + rule을 system reminder로 inject → 같은 지점부터 retry. compaction 살아남음
5. **First-class subagents** — `task`로 isolated worktree에 fan-out, schema-validated object return. prose parsing X
6. **Read PDF/arxiv** — `web_search`가 14개 provider chain. URL→`read`로 markdown + anchor 보존
7. **Unapologetically native (Windows 포함)** — ripgrep / glob / find가 process 내 link. `brush` shell이 세션 유지
8. **Code review w/ priorities + verdict** — `/review`가 reviewer subagent 띄워 branch/commit/uncommitted 병렬 sweep. P0–P3 + confidence
9. **Hashline edits** — content hash anchor로 줄 재타이핑 X. stale anchor면 patch reject. Grok 4 Fast 출력 토큰 -61%
10. **GitHub == filesystem** — `read pr://1428`이 `read src/foo.ts`와 같은 shape. 별도 `gh_*` 툴 X
11. **Hindsight memory** — 에이전트가 mid-run에 `retain` / `recall` / `reflect`. project-scoped
12. **ACP — editor-drivable** — Zed에서 omp 실행 = TUI에서 driving과 같음. 모든 destructive tool은 permission prompt
13. **Inherits existing config** — Cursor MDC, Cline `.clinerules`, Codex `AGENTS.md`, Copilot applyTo 등 8개 포맷 그대로 read. 마이그레이션 X
14. **`omp commit`** — git-overview + git-hunk로 atomic split, dependency 순서. lock file 제외, 소스 > 테스트 우선
15. **URL schemes** — `pr://` · `issue://` · `agent://` · `skill://` · `rule://` 등 10개가 모든 FS-shaped tool 안에서 transparent resolve
16. **Conflict resolution** — `write conflict://N` ← `@theirs` / `@ours` / `@base`. bulk는 `conflict://*`
17. **Preview then accept** — `ast_edit`은 _(proposed)_ card. `resolve`로 atomic accept
18. **Real browser drive** — stealth on by default. Slack 같은 Electron app도 in-place로

## 32 built-in tools (네임스페이스 통합)

**Files & search** — `read` (files/dirs/archives/SQLite/PDF/notebook/URL/`://` schemes), `write`, `edit` (hashline), `ast_edit` (preview), `ast_grep` (50+ tree-sitter), `search` (regex), `find` (glob)

**Runtime** — `bash` (PTY/background-job), `eval` (Python+JS, shared prelude, tool re-entry), `recipe` (bun/just/make/cargo), `ssh`

**Code intelligence** — `lsp` (diagnostics/nav/symbols/rename/code-action), `debug` (DAP)

**Coordination** — `task` (parallel subagent, workspace-isolated), `irc` (live agent 간 prose), `todo_write`, `job`, `ask` (structured Q)

**Outside** — `browser` (Puppeteer/CDP), `web_search` (14 provider chain), `github`, `generate_image` (Gemini), `inspect_image`, `render_mermaid`

**Memory** — `checkpoint`, `rewind`, `retain`, `recall`, `reflect`

**Misc** — `calc`, `resolve`, `search_tool_bm25` (mid-session tool 활성화)

Setting-gated default-off: `github`, `calc`, `inspect_image`, `render_mermaid`, `checkpoint`, `rewind`, `search_tool_bm25`, `retain`, `recall`, `reflect`.

## 40+ provider, 한 `/model`로 swap

### Frontier APIs
Anthropic (oauth) · OpenAI · OpenAI Codex (oauth) · Gemini · Antigravity (oauth) · xAI · Mistral · Groq · Cerebras · Fireworks · Together · HF · NVIDIA · OpenRouter · Synthetic · Vercel AI Gateway · Cloudflare AI Gateway · Perplexity (oauth)

### Coding plans
Cursor (oauth) · Copilot (oauth) · GitLab Duo · Kimi · Moonshot · MiniMax · Alibaba · Qwen · Z.AI/GLM · Xiaomi MiMo · Qianfan · NanoGPT · Venice · Kilo · ZenMux · OpenCode Go · OpenCode Zen

### Run yourself
Ollama (local) · Ollama Cloud · LM Studio (local) · llama.cpp (local) · vLLM (local) · LiteLLM

### Routing knobs
- **Custom providers** — `~/.omp/agent/models.yml`에 declare (`openai-completions` / `responses` / `azure-openai-responses` / `anthropic-messages` / `google-generative-ai` / `vertex`)
- **Fallback chains** — `retry.fallbackChains` per role. 429 시 다음 entry로
- **Path-scoped roles** — `modelRoles.paths:` 중첩. 특정 repo만 무거운 `default`
- **Round-robin credentials** — provider당 API key stack rotate (session affinity + per-credential backoff)

### Roles
`default` (normal) · `smol` (cheap subagent) · `slow` (deep reasoning) · `plan` (plan mode) · `commit` (changelog). `--smol/--slow/--plan` launch override, `Ctrl+P`로 cycle, `/model` slash로 mid-session swap.

## 4 entry points

| 모드 | 명령 | 용도 |
|---|---|---|
| Interactive TUI | `omp` | 기본 |
| One-shot | `omp -p "<prompt>"` | 단일 prompt 후 exit |
| Node SDK | `@oh-my-pi/pi-coding-agent` | 호스트 프로세스에 임베드 |
| RPC | `omp --mode rpc` | NDJSON over stdio (non-Node embedder) |
| ACP | `omp acp` | Zed 같은 editor가 driving |

```ts
import { ModelRegistry, SessionManager, createAgentSession, discoverAuthStorage } from "@oh-my-pi/pi-coding-agent";

const auth = await discoverAuthStorage();
const models = new ModelRegistry(auth);
await models.refresh();
const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
  authStorage: auth,
  modelRegistry: models,
});
await session.prompt("list .ts files");
```

## Web search

`auto`가 14-provider chain — Exa · Brave · Jina · Kimi · ZAI · Anthropic · Perplexity · Gemini · Codex · Tavily · Parallel · Kagi · Synthetic · SearXNG. 핸들러: GitHub/GitLab · npm/PyPI/crates.io/Hex/Hackage/NuGet/Maven/RubyGems/Packagist/pub.dev/Go · arxiv · semantic scholar · stackoverflow · reddit · HN · mdn · readthedocs · docs.rs · NVD · OSV · CISA KEV. HTML→markdown + anchor 보존.

## ~27k LoC Rust core

3 crate + 1 N-API addon. search · shell · AST · highlight · PTY · image decode · BPE 토큰 카운팅 모두 libuv pool 안. fork/exec hot path X.

- crates: `pi-natives` · `pi-shell` · `pi-ast`
- platforms: `linux-x64` · `linux-arm64` · `darwin-x64` · `darwin-arm64` · `win32-x64`

대표 모듈: shell (brush vendored, ~3700) · grep (~1900) · keys (kitty keyboard, ~1490) · text (ANSI-aware, ~1450) · summarize (tree-sitter, ~1040) · ast (ast-grep, ~1000)

## Extensibility

확장 = TypeScript 모듈. built-in과 동일 tool API · slash registry · hotkey · TUI primitive. **첫 run에 disk에 이미 있는 rule/skill/MCP를 inherit** (`.claude` / `.cursor` / `.windsurf` / `.gemini` / `.codex` / `.cline` / `.github/copilot` / `.vscode`). 마이그레이션 스크립트 X.

omp에게 missing piece 직접 짜라고 한 뒤 `/reload-plugins` → local 유지, marketplace ship, npm publish.

## 참고

- 웹: <https://omp.sh>
- 풀 docs: <https://omp.sh/docs>
- 블로그 (the harness problem): <https://blog.can.ac/2026/02/12/the-harness-problem/>
- npm: <https://www.npmjs.com/package/@oh-my-pi/pi-coding-agent>
