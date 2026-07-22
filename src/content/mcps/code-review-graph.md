---
title: code-review-graph
summary: "코드를 Tree-sitter로 파싱해 지식 그래프로 만들고, 리뷰에 필요한 영향 반경·변경 blast radius만 골라 넘겨 토큰을 아끼는 MCP. 툴 30종과 리뷰 스킬 7종이 따라오고, 여러 레포를 레지스트리에 등록하면 상위 폴더에서도 교차 검색된다."
summary_en: "Parses your codebase with Tree-sitter into a persistent graph, then feeds reviews only the impact radius instead of whole files. 30 MCP tools, 7 review skills, and a multi-repo registry for cross-repo search."
tags: [mcp, code-review, knowledge-graph, tree-sitter, impact-analysis, monorepo, local]
source: https://github.com/tirth8205/code-review-graph
author: tirth8205
license: MIT
order: 22
server_name: code-review-graph
transport: stdio
---

## 무엇을 하는가

레포를 Tree-sitter로 파싱해 구조 그래프를 만들고, "이 변경이 어디까지 번지는가"를 파일 전체를 읽지 않고 답한다. 리뷰·디버깅·구조 파악에서 읽어야 할 양을 크게 줄이는 게 목적이다.

*EN: Persistent incremental knowledge graph for token-efficient, context-aware code reviews.*

MCP 툴 30종 중 자주 쓰는 것들:

- `get_impact_radius` — 변경의 영향 반경
- `get_review_context` — 리뷰에 필요한 최소 맥락
- `detect_changes` / `get_affected_flows` — 변경 감지와 영향받는 흐름
- `query_graph` / `semantic_search_nodes` — 그래프 질의와 의미 검색
- `get_architecture_overview` / `list_communities` — 구조 조망
- `list_repos` / `cross_repo_search` — 등록된 여러 레포를 한 번에 검색

함께 깔리는 스킬 7종: `build-graph`, `review-pr`, `review-changes`, `review-delta`, `explore-codebase`, `debug-issue`, `refactor-safely`.

## 설치

```bash
pipx install code-review-graph     # 또는: uv tool install code-review-graph
cd <레포> && code-review-graph build
```

MCP 등록은 설치된 바이너리의 **절대경로**로 직접 넣는 편이 안전하다.

```json
{
  "mcpServers": {
    "code-review-graph": {
      "command": "/Users/you/.local/bin/code-review-graph",
      "args": ["serve"]
    }
  }
}
```

## 함정

- **`code-review-graph install`은 전역 명령이 아니다.** 실행한 디렉터리의 레포에 `.cursorrules`·`.windsurfrules`·`QODER.md`·`.kiro/steering/*` 등을 만들고 프로젝트 `CLAUDE.md`에 내용을 덧붙인다. 반드시 `--dry-run`으로 파일 목록을 먼저 보고, 필요하면 `--no-instructions --no-hooks --platform <하나>`로 범위를 좁힌다. `.gitignore`도 건드리니 실행 후 `git status`를 확인할 것.
- **"로딩 중"에서 안 끝나면 러너 오탐이다.** 설치기가 pipx로 깔았는데도 `command: "uvx"`로 적어 두는 경우가 있다. 그러면 콜드 스타트마다 패키지를 새로 받아(74개, tree-sitter 번들 31.5MiB) MCP 핸드셰이크가 타임아웃한다 — 에러가 아니라 무한 로딩으로 보인다. `command`를 실제 바이너리 절대경로로 바꾸면 기동이 1~2초로 떨어진다.
- **`cwd` 하드코딩을 지울 것.** 설치기가 실행 당시 디렉터리를 전역 설정에 박아 넣어, 다른 프로젝트에서도 엉뚱한 레포의 그래프를 보게 된다.
- **툴이 뜨는 것과 답하는 것은 다르다.** 서버가 떠도 그래프가 없으면 툴 호출 시점에 인덱싱이 시작돼 오래 걸린다. `code-review-graph build`로 미리 만들어 두면 진행 상황이 보이고 MCP 타임아웃과도 무관해진다.
- **모노레포는 서비스 단위로.** 상위 폴더에서 한 번에 만들지 말고 실제 레포 루트마다 만든 뒤 `code-review-graph register <path> --alias <name>`으로 등록한다. 그러면 상위 폴더에서 열어도 `cross_repo_search`로 전부 닿고, 깊은 분석은 `repo_root`를 명시해 부른다.
- vendored 자산이 많은 프런트엔드 레포는 노드·엣지가 과대 계상되고 그래프가 수백 MB까지 커진다. 소스만 보고 싶다면 범위를 좁혀 다시 만드는 편이 낫다.
