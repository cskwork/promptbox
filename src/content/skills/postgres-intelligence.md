---
title: postgres-intelligence
summary: "AI 코딩 도구가 DB 비밀번호를 직접 보지 않고도 PostgreSQL을 안전하게 조회하게 해준다. 기본은 읽기만, 데이터 변경은 허용해야만 실행."
summary_en: "AI tools query your PostgreSQL safely — credentials stay in the script, read-only by default, writes only when you allow."
tags: [skill, postgres, sql, database, claude-code, codex, cursor, windsurf, explain]
source: https://github.com/cskwork/postgres-intelligence
author: cskwork
license: MIT
order: 40
trigger: "PostgreSQL / Postgres / SQL / schema / EXPLAIN / pg_catalog / information_schema"
install: "git clone https://github.com/cskwork/postgres-intelligence && cd postgres-intelligence && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && cp .env.example .env"
---

## 한 줄

역할을 둘로 나눈다 — AI는 SQL을 만들기만 하고, 비밀번호를 읽어 실제 접속하는 일은 스크립트가 맡는다. AI는 `.env`(접속 정보 파일)를 열거나 출력하지 않고, 안전하게 정리된 결과와 스키마 정보, 에러 메시지만 받아 본다.

*EN: The AI only writes the SQL; the script loads the password and connects — so credentials never reach the AI.*

## 무엇을 하는가

- `.env`에서 `DB1_...DB10_...` 다중 PostgreSQL 연결 로드
- 비밀번호/full DSN(DB 접속 문자열 전체) 노출 없이 connectivity(연결 가능 여부) 테스트
- `information_schema` + `pg_catalog`에서 스키마 메타데이터 추출
- 기본 read-only SQL — `SELECT`, `WITH`, `SHOW`, `EXPLAIN`
- write / DDL(테이블 구조 변경 명령)는 명시적 `--allow-write` / `--allow-ddl` (+ user approval(사용자 승인))
- 멀티 statement(여러 SQL 문장) / `UPDATE`·`DELETE` without `WHERE` 차단
- LLM 친화적 structured(구조화된) JSON 출력
- `EXPLAIN`, 인덱스(B-tree/GIN/BRIN), JSONB, maintenance(유지보수) 가이던스

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
6. 에러 시 `sqlstate`(오류 상태 코드) + suggestion으로 refine(정제). **최대 3회**
7. 실행 SQL / 핵심 row / row count / 추론 보고. 자격증명은 보고하지 않음

## SKILL.md 본문 (그대로 복사)

````markdown
---
name: postgres-intelligence
description: 'PostgreSQL for LLM agents: inspect schemas, run safe SQL, translate natural language to queries. Use when connecting to a PostgreSQL database, exploring an unfamiliar schema, debugging a SQL error, or investigating query performance.'
---


# postgres-intelligence

Credential-safe PostgreSQL access for LLM coding agents. The scripts load credentials from `.env` at runtime and print only safe summaries, schema metadata, query results, and errors. The agent writes SQL, calls the scripts, and reads that output; it never opens or prints `.env` itself.

## Install

`.env`, `scripts/`, and `schema_metadata.json` all live in the skill directory. Run every command in this file from there.

```bash
cd postgres-intelligence           # repo root
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
cd skills/postgres-intelligence    # the skill directory
cp ../../.env.example .env
python scripts/config.py
python scripts/db_connector.py
python scripts/schema_extractor.py
```

## Configure

Fill `.env` from the keys in `../../.env.example`, the public template: connections `DB1_` through `DB10_`, or `DB1_DSN`, which takes precedence over the host/port fields. `DB*_NAME` is the connection key `--db` expects. Keep real `.env`, `.venv`, and `schema_metadata.json` out of git.

## Commands

```bash
# Validate loaded config; prints host, user, and database, never passwords or DSNs
python scripts/config.py

# Test all configured connections
python scripts/db_connector.py

# Extract schema metadata for every connection into schema_metadata.json
python scripts/schema_extractor.py

# Run a read-only query against the default connection
python scripts/query_executor.py "SELECT current_database(), current_schema();"

# Select a named connection
python scripts/query_executor.py --db analytics "SELECT count(*) FROM public.events;"

# Agent-friendly JSON output
python scripts/query_executor.py --json-only "SELECT now();"

# Raise the 30000 ms statement_timeout for a long analytical query
python scripts/query_executor.py --statement-timeout-ms 120000 "SELECT count(*) FROM public.events;"

# Writes require explicit user approval
python scripts/query_executor.py --allow-write "UPDATE table_name SET flag = true WHERE id = 1;"

# DDL requires explicit user approval
python scripts/query_executor.py --allow-ddl "CREATE INDEX CONCURRENTLY idx_name ON table_name (col);"
```

## Agent Workflow

1. Identify the target connection, schema, table, time range, and result limit.
2. Run `python scripts/config.py` to confirm the connection is configured; it validates `.env` without printing secrets.
3. Read `schema_metadata.json` in the skill directory before generating SQL; if it is absent or stale, run `python scripts/schema_extractor.py` to rewrite it.
4. If the target table is still missing from that metadata, query `information_schema` or `pg_catalog` for it first.
5. Prefer explicit columns over `SELECT *`; add `LIMIT` for exploratory reads.
6. On errors, use `sqlstate` and suggestions to refine the query, with a maximum of three attempts.
7. Report the executed SQL, key rows, row count, and reasoning. Do not report credentials.

## Safety Model

- Read-only by default: `SELECT`, `WITH`, `SHOW`, and `EXPLAIN` run with no flag.
- Writes require `--allow-write`.
- DDL and maintenance commands require `--allow-ddl`.
- `UPDATE` and `DELETE` without `WHERE` are blocked.
- Multiple SQL statements in one call are blocked.
- Every query runs under a `statement_timeout` of 30000 ms unless `--statement-timeout-ms` raises it.
- Passwords and full DSNs are never printed.

## PostgreSQL Guidance

- Use `EXPLAIN (ANALYZE, BUFFERS)` for performance work.
- Verify index usage before and after adding indexes.
- Use `CREATE INDEX CONCURRENTLY` for large production tables when appropriate.
- Run `ANALYZE` after bulk data changes.
- Use B-tree for common equality/range access, GIN for JSONB containment and full-text patterns, BRIN for large append-only time-series tables.
- Use connection pooling such as PgBouncer for long-running applications; agent scripts are short-lived.

Read `../../references/postgres_best_practices.md` before recommending an index, a partitioning or schema change, or a maintenance job.

````
