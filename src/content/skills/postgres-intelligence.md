---
title: postgres-intelligence
summary: 코딩 에이전트(Claude Code · Codex · Cursor · Windsurf)가 PostgreSQL을 *자격증명 노출 없이* 안전하게 다루도록 한다. read-first SQL (SELECT/WITH/SHOW/EXPLAIN), write/DDL는 명시 플래그, 다중 연결(`DB1_...DB10_...`), 스키마 메타데이터 추출, JSON 출력.
tags: [skill, postgres, sql, database, claude-code, codex, cursor, windsurf, explain]
source: https://github.com/cskwork/postgres-intelligence
author: cskwork
license: MIT
order: 40
trigger: "PostgreSQL / Postgres / SQL / schema / EXPLAIN / pg_catalog / information_schema"
install: "git clone https://github.com/cskwork/postgres-intelligence && cd postgres-intelligence && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && cp .env.example .env"
---

## 한 줄

"에이전트는 SQL을 *만들고*, 스크립트는 *자격증명을 로드한다*"로 contract를 가른다. 에이전트는 `.env`를 열거나 print하지 않는다 — 안전한 summaries / query result / metadata / error만 본다.

## 무엇을 하는가

- `.env`에서 `DB1_...DB10_...` 다중 PostgreSQL 연결 로드
- 비밀번호/full DSN 노출 없이 connectivity 테스트
- `information_schema` + `pg_catalog`에서 스키마 메타데이터 추출
- 기본 read-only SQL — `SELECT`, `WITH`, `SHOW`, `EXPLAIN`
- write / DDL는 명시적 `--allow-write` / `--allow-ddl` (+ user approval)
- 멀티 statement / `UPDATE`·`DELETE` without `WHERE` 차단
- LLM 친화적 structured JSON 출력
- `EXPLAIN`, 인덱스(B-tree/GIN/BRIN), JSONB, maintenance 가이던스

## 설치

```bash
git clone https://github.com/cskwork/postgres-intelligence
cd postgres-intelligence
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env  # DB1_HOST/PORT/USER/PASSWORD/DATABASE/NAME 등 채우기
```

## 사용

```bash
python scripts/config.py                                      # 비밀번호 print 없이 config validate
python scripts/db_connector.py                                # 모든 연결 테스트
python scripts/schema_extractor.py                            # 스키마 메타데이터
python scripts/query_executor.py "SELECT current_database();"
python scripts/query_executor.py --db analytics "SELECT count(*) FROM public.events;"
python scripts/query_executor.py --json-only "SELECT now();"  # agent-friendly
python scripts/query_executor.py --allow-write "UPDATE t SET flag=true WHERE id=1;"
python scripts/query_executor.py --allow-ddl "CREATE INDEX CONCURRENTLY ix ON t (col);"
```

## 에이전트 워크플로우

1. 대상 connection / schema / table / time range / limit 식별
2. `.env` 존재 확인하되 열지 말 것
3. SQL 생성 전 `schema_metadata.json` 로드/리프레시
4. 스키마 컨텍스트 부족하면 `information_schema` / `pg_catalog` 먼저
5. `SELECT *` 대신 명시 컬럼, 탐색용 read에는 `LIMIT`
6. 에러 시 `sqlstate` + suggestion으로 refine. **최대 3회**
7. 실행 SQL / 핵심 row / row count / 추론 보고. 자격증명은 보고하지 않음

## SKILL.md 본문 (그대로 복사)

````markdown
---
name: postgres-intelligence
description: Use when an LLM agent needs to connect to PostgreSQL, inspect schemas, run safe SQL, translate natural language into PostgreSQL queries, or analyze query performance without exposing credentials.
license: MIT
metadata:
  author: cskwork
  version: "1.0.0"
  triggers: PostgreSQL, Postgres, SQL, database, schema, EXPLAIN, pg_catalog, information_schema
  runtimes: Claude Code, Codex, Cursor, Windsurf, local LLM agents
---

# postgres-intelligence

PostgreSQL intelligence for LLM coding agents. It gives Claude Code, Codex, and
other local agents a credential-safe way to discover PostgreSQL schemas, run
read-first SQL, inspect query errors, and reason about performance.

The core rule is simple: the agent should not open or print .env directly.
Scripts load credentials at runtime, and the agent only sees safe summaries,
query results, and metadata.

## What It Does

- Loads one or more PostgreSQL connections from .env using DB1_...DB10_...
- Tests connectivity without printing passwords or full DSNs.
- Extracts schema metadata from information_schema and pg_catalog.
- Executes read-only SQL by default: SELECT, WITH, SHOW, and EXPLAIN.
- Blocks writes and DDL unless explicit flags are passed after user approval.
- Returns structured JSON that any LLM agent can parse.
- Provides PostgreSQL-specific guidance for indexes, JSONB, EXPLAIN, and maintenance.

## Install

cd postgres-intelligence
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python scripts/config.py
python scripts/db_connector.py
python scripts/schema_extractor.py

Use .env.example as the public template. Keep real .env, .venv, and
schema_metadata.json out of git.

## Configure

DB1_HOST=localhost
DB1_PORT=5432
DB1_USER=your_username
DB1_PASSWORD=your_password
DB1_DATABASE=your_database
DB1_NAME=primary
DB1_SSLMODE=prefer
DB1_CONNECT_TIMEOUT=10
DB1_APPLICATION_NAME=postgres-intelligence

Use DB*_NAME as the connection key for --db.

## Commands

python scripts/config.py
python scripts/db_connector.py
python scripts/schema_extractor.py
python scripts/query_executor.py "SELECT current_database(), current_schema();"
python scripts/query_executor.py --db analytics "SELECT count(*) FROM public.events;"
python scripts/query_executor.py --json-only "SELECT now();"
python scripts/query_executor.py --allow-write "UPDATE t SET flag=true WHERE id=1;"
python scripts/query_executor.py --allow-ddl "CREATE INDEX CONCURRENTLY ix ON t (col);"

## Agent Workflow

1. Identify target connection, schema, table, time range, and result limit.
2. Confirm .env exists but do not open or print it.
3. Load or refresh schema_metadata.json before generating SQL.
4. If schema context is missing, query information_schema or pg_catalog first.
5. Prefer explicit columns over SELECT *; add LIMIT for exploratory reads.
6. On errors use sqlstate and suggestions to refine the query, max 3 attempts.
7. Report executed SQL, key rows, row count, reasoning. Never credentials.

## Safety Model

- Agent generates SQL and calls scripts.
- Scripts load credentials from .env.
- Passwords and full DSNs are never printed.
- UPDATE and DELETE without WHERE are blocked.
- Multiple SQL statements in one call are blocked.
- DDL and maintenance commands require --allow-ddl.
- Writes require --allow-write.

## PostgreSQL Guidance

- Use EXPLAIN (ANALYZE, BUFFERS) for performance work.
- Verify index usage before and after adding indexes.
- Use CREATE INDEX CONCURRENTLY for large production tables when appropriate.
- Run ANALYZE after bulk data changes.
- Use B-tree for equality/range, GIN for JSONB containment / full-text, BRIN
  for large append-only time-series.
- Use connection pooling such as PgBouncer for long-running apps; agent
  scripts are short-lived.

Read references/postgres_best_practices.md only when deeper PostgreSQL-specific
guidance is needed.
````
