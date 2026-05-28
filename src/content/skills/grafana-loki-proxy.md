---
title: grafana-loki-proxy
summary: "Loki 로그를 따로 인증 설정할 필요 없이, 평소 쓰던 Grafana 로그인만으로 명령줄에서 검색하고 보기 좋은 HTML 리포트로 뽑아주는 도구. dev/운영 환경을 나눠 관리하고 큰 조회는 자동으로 쪼개 안전하게 가져온다."
summary_en: "Search your Loki logs from the command line using just your Grafana login — no separate auth setup — and export a shareable HTML report, with per-environment profiles and auto-chunked large queries."
tags: [skill, grafana, loki, observability, logql, devops, basic-auth, html-report]
source: https://github.com/grafana/grafana
author: cskwork (skill author)
license: MIT
order: 75
trigger: "Loki 로그 조회 / Grafana proxy로 LogQL / observability 인증 / loki curl 만들기 / 로그 HTML report"
---

## 한 줄

Loki에 직접 붙는 대신 Grafana를 통해서 조회한다 — Grafana 계정만 있으면 Loki 인증을 따로 셋업하지 않아도 로그를 검색할 수 있다. `payload(요청 미리보기) → curl(명령 생성) → query(실행) → report(HTML 리포트)` 네 모드.

*EN: Query Loki through Grafana, so your existing Grafana account is all the auth you need. Four modes: preview, curl, query, report.*

## 언제 쓰는가

- Grafana 대시보드에 Loki가 등록돼 있고, CLI/스크립트에서 같은 데이터에 접근하고 싶을 때
- 환경별(dev / stg / prod) endpoint(접속 주소)와 인증을 프로필로 분리 관리하고 싶을 때
- 로그 분석 결과를 클라이언트 사이드 필터링되는 self-contained(외부 의존 없이 단독 실행되는) HTML로 공유하고 싶을 때

## Quick Start

```bash
# payload만 미리 보기
python3 scripts/grafana_proxy_loki.py payload --expr '{job="myapp"}'

# 실행할 curl 생성 (실행은 안 함)
python3 scripts/grafana_proxy_loki.py curl --profile dev \
  --expr '{job="myapp"}' --from now-1h --jq

# 실제 query
python3 scripts/grafana_proxy_loki.py query --profile dev \
  --expr '{job="myapp"}'

# HTML report (요약 카드 + 레이블 통계 + 필터링 가능한 로그 테이블)
python3 scripts/grafana_proxy_loki.py report --profile prod \
  --expr '{job="myapp"}' --from now-1h --max-lines 1000 \
  -o /tmp/loki-report.html --open
```

## .env 구성

공통 fallback + 프로필별 override:

```bash
# 공통
GRAFANA_BASE_URL="https://grafana.example.com/api/ds/query"
GRAFANA_EMAIL="name@example.com"
GRAFANA_PASSWORD="..."
GRAFANA_DATASOURCE_UID="loki"

# 환경별 (있으면 공통 override)
GRAFANA_PROFILE="dev"
GRAFANA_DEV_BASE_URL="https://grafana-dev.example.com/api/ds/query"
GRAFANA_DEV_EMAIL="name@example.com"
GRAFANA_DEV_PASSWORD="..."
GRAFANA_DEV_DATASOURCE_UID="loki"

GRAFANA_PROD_BASE_URL="https://grafana-prod.example.com/api/ds/query"
GRAFANA_PROD_DATASOURCE_UID="abcdef12345"  # auto-generated 가능
```

`--profile dev|stg|prod` 플래그로 선택. `GRAFANA_BASE_URL`은 root URL 또는 전체 `/api/ds/query` URL 둘 다 허용.

## 실전 함정

### 1. datasource UID는 자동생성될 수 있음

Grafana 재설치/업데이트 시 datasource UID가 바뀔 수 있다. 404 발생하면 `GET /api/datasources`로 현재 UID 확인.

### 2. fluentbit 클러스터 분리 시 stream selector 주의

여러 fluentbit 클러스터가 로그를 분리 수집하면 `{file_type="file"}`만 쓸 때 한쪽 클러스터만 반환될 수 있다. 명시적으로 `file=~"svc1|svc2|..."` regex로 전부 포함시킨다.

### 3. 큰 volume stream은 윈도우 분할

`|= "ERROR"` 필터 + 1h 이상 범위는 Loki gateway 504 timeout 위험. **15분 윈도우로 분할 조회 후 합산**:

```bash
for i in $(seq 0 11); do
  FROM_MIN=$(( ($i + 1) * 15 ))
  TO_MIN=$(( $i * 15 ))
  TO=$( [ $TO_MIN -eq 0 ] && echo "now" || echo "now-${TO_MIN}m" )
  FROM="now-${FROM_MIN}m"

  curl -s -u "${GRAFANA_PROD_EMAIL}:${GRAFANA_PROD_PASSWORD}" \
    -H "Content-Type: application/json" \
    -X POST "${GRAFANA_PROD_BASE_URL}" \
    -d "{\"queries\":[{\"refId\":\"A\",\"datasource\":{\"uid\":\"${DS_UID}\",\"type\":\"loki\"},\"expr\":\"{job=\\\"myapp\\\"} |= \\\"ERROR\\\"\",\"queryType\":\"range\",\"direction\":\"backward\",\"maxLines\":200}],\"from\":\"$FROM\",\"to\":\"$TO\"}" \
    --max-time 30 >> /tmp/errors.jsonl
done
```

### 4. `$UID` shell 빌트인 충돌

```bash
# WRONG - $UID는 macOS/Linux 빌트인 (사용자 ID, 예: 501)
UID="abcdef12345"
--datasource-uid "$UID"    # → "501"로 치환됨!

# CORRECT
DS_UID="abcdef12345"
--datasource-uid "$DS_UID"
```

### 5. `detected_level`은 stream selector에 못 씀

`detected_level`은 Loki가 쿼리 시점에 파생하는 라벨이라 인덱스가 없다. `{detected_level="error"}`는 항상 0건. **로그 본문 필터 `|= "ERROR"` 써야 한다**.

### 6. 응답 JSON 구조 (파싱용)

```
results.A.frames[].data.values[0] → labels (dict[])
results.A.frames[].data.values[1] → timestamps (ns int[])
results.A.frames[].data.values[2] → log lines (string[]) — JSON 래핑: {"log":"..."}
```

로그 라인은 `{"log":"..."}` JSON으로 래핑된 경우가 많다. 파싱 시 `json.loads(line).get('log')`.

### 7. Python 스크립트 vs 직접 curl

`grafana_proxy_loki.py`의 `from` 상대시간 변환은 간헐적 400 발생 가능. **대량 prod 조회는 직접 curl이 가장 안정**.

| 방식 | 안정성 | 용도 |
|------|--------|------|
| `query` 서브커맨드 | 간헐적 400 | 짧은 범위, dev |
| `report` 서브커맨드 | 양호 | HTML 리포트 |
| **직접 curl** | **가장 안정** | prod 대량, 분할 조회 |

## Safety Rules

- 비밀번호를 문서/코드에 하드코딩 금지 (`.env` 사용)
- dev에서 패턴 검증한 뒤 같은 패턴으로 stg/prod 프로필 추가
- 실행 전 datasource UID와 시간 범위를 한 번 더 확인
- prod 404 → 가장 먼저 datasource UID 변경 여부 확인
- 셸 변수명에 `UID` 금지 (`DS_UID` 사용)
- 큰 volume stream은 항상 윈도우 분할
