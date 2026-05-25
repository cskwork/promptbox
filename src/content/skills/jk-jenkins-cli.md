---
title: jk (Jenkins CLI)
summary: GitHub CLI 스타일의 Jenkins controller CLI. 잡 검색/조회, 빌드 트리거/취소/팔로우, 로그 스트리밍, artifact 다운로드, credential·node·queue·plugin 관리까지 — `jk auth login`으로 context 전환.
tags: [skill, jenkins, cli, devops, ci, pipeline, build, jk]
source: https://github.com/avivsinai/jenkins-cli
author: avivsinai
license: 원본 저장소 참조
order: 72
trigger: "jenkins / jk / pipeline / build / run logs / job list / jenkins credentials / jenkins node"
install: "brew install avivsinai/tap/jk"
---

## 한 줄

`jk run start <job> -p KEY=value`로 빌드 트리거, `jk run ls <job> --limit 3`로 상태 확인, `jk log <job> <build> --follow`로 콘솔 추적 — Jenkins UI를 안 거치고 같은 워크플로우.

## 언제 쓰는가

- CI 잡을 셸에서 트리거하거나 결과를 스크립트로 받고 싶을 때
- 여러 controller(prod/stg)를 context로 전환하며 쓸 때
- 빌드 로그를 LLM context에 깔끔하게 가져오고 싶을 때

## 의존성 확인

`jk` 실행 전 반드시:

```bash
jk --version
```

설치 (실패 시):

| Platform | Command |
|----------|---------|
| macOS/Linux | `brew install avivsinai/tap/jk` |
| Windows | `scoop bucket add avivsinai https://github.com/avivsinai/scoop-bucket && scoop install jk` |
| Go | `go install github.com/avivsinai/jenkins-cli/cmd/jk@latest` |
| Binary | [GitHub Releases](https://github.com/avivsinai/jenkins-cli/releases) |

## 인증

```bash
# 로그인
jk auth login https://jenkins.example.com --username alice --token <API_TOKEN>

# context 이름 지정
jk auth login https://jenkins.example.com --name prod --username alice --token <TOKEN>

# self-signed TLS
jk auth login https://jenkins.example.com --username alice --token <TOKEN> --insecure
jk auth login https://jenkins.example.com --username alice --token <TOKEN> --ca-file /path/to/ca.pem

# 상태
jk auth status
jk auth logout            # active context
jk auth logout prod       # 특정 context
```

## Context

```bash
jk context ls             # *는 active
jk context use prod-jenkins
jk context rm staging
```

환경변수 `JK_CONTEXT`로 override.

## Quick Reference

| Task | Command |
|------|---------|
| 잡 검색 | `jk search --job-glob '*deploy*'` |
| 잡 목록 | `jk job ls` |
| 잡 상세 | `jk job view team/app` |
| 실행 목록 | `jk run ls team/app` |
| 실행 트리거 | `jk run start team/app -p KEY=value` |
| 실행 상세 | `jk run view team/app 128` |
| 로그 팔로우 | `jk run start team/app --follow` |
| 로그 스트림 | `jk log team/app 128 --follow` |
| 아티팩트 | `jk artifact download team/app 128` |
| 테스트 리포트 | `jk test report team/app 128` |
| credential | `jk cred ls` |
| node | `jk node ls` |
| queue | `jk queue ls` |
| plugin | `jk plugin ls` |

## 자주 쓰는 패턴

### 잡 검색

```bash
jk search --job-glob '*deploy*' --limit 10
jk search --folder team/services --job-glob '*api*'
jk search --job-glob '*' --filter result=FAILURE --since 7d
jk search --job-glob '*/deploy-*' --filter param.ENV=production
```

### 빌드 트리거 및 결과

```bash
# 트리거 + 파라미터
jk run start team/app/pipeline -p BRANCH=main -p ENV=staging

# 트리거 + 로그 팔로우
jk run start team/app/pipeline --follow

# 트리거 + 완료 대기 (로그 스트림 X)
jk run start team/app/pipeline --wait --timeout 10m

# 결과만
jk run start team/app/pipeline --follow --result

# fuzzy job 매칭
jk run start deploy --fuzzy
```

### 로그

```bash
jk log team/app/pipeline 128                # snapshot
jk log team/app/pipeline 128 --follow       # 라이브
jk log team/app/pipeline 128 --plain        # 장식 없음 (LLM context에 좋음)
```

### 아티팩트

```bash
jk artifact ls team/app/pipeline 128
jk artifact download team/app/pipeline 128
jk artifact download team/app/pipeline 128 --pattern "**/*.jar"
jk artifact download team/app/pipeline 128 -o ./artifacts/
```

### Credential

```bash
jk cred ls
jk cred create-secret --id my-secret --secret "value" --description "API key"
echo "secret-value" | jk cred create-secret --id my-secret --from-stdin
jk cred create-secret --id my-secret --secret "value" --scope folder --folder team/app
```

### Node 관리

```bash
jk node ls
jk node cordon agent-01 --message "Maintenance"
jk node uncordon agent-01
jk node rm agent-01
```

## 출력 모드

```bash
jk run ls team/app --json
jk run ls team/app --yaml
jk run ls team/app --json --jq '.items[0].number'
jk run ls team/app --json --template '{{range .items}}{{.number}}{{end}}'
jk run start team/app --quiet
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Validation error |
| 3 | Not found |
| 4 | Authentication failure |
| 5 | Permission denied |
| 6 | Connectivity failure |
| 7 | Timeout |
| 8 | Feature unsupported |

`--follow`/`--wait` 빌드 결과 코드:

| Code | Result |
|------|--------|
| 0 | SUCCESS |
| 10 | UNSTABLE |
| 11 | FAILURE |
| 12 | ABORTED |
| 13 | NOT_BUILT |
| 14 | RUNNING |

## 함정

- **중복 트리거 주의**: `jk run start`가 timeout으로 빠져도 Jenkins 서버에는 이미 트리거된 경우 많다. 재시도 전에 `jk run ls <JOB> --limit 3`으로 상태 먼저 확인 — RUNNING 빌드가 있으면 그게 트리거된 것. 중복 발생 시 `jk run cancel <JOB> <BUILD_NO>`로 이전 빌드 취소.
- `--follow`/`--wait` 옵션은 일부 환경에서 hang 가능 — 대신 트리거 후 `jk run ls`로 폴링하는 패턴이 더 안정
- `jk run start` 응답 자체가 20~30초 걸리는 게 정상 (Jenkins 큐 등록 시간 포함)
- 파라미터 없이 트리거하면 400 Bad Request — 잡의 필수 파라미터를 `jk run params <job>`으로 먼저 확인

## 원문 SKILL.md

````yaml
---
name: jk
version: 1.0.0
description: Jenkins CLI for controllers. Use when users need to manage jobs, pipelines, runs, logs, artifacts, credentials, nodes, or queues in Jenkins. Triggers include "jenkins", "jk", "pipeline", "build", "run logs", "job list", "jenkins credentials", "jenkins node".
install:
  brew: "brew install avivsinai/tap/jk"
  go: "go install github.com/avivsinai/jenkins-cli/cmd/jk@latest"
  binary: "https://github.com/avivsinai/jenkins-cli/releases"
verify: "jk --version"
metadata:
  short-description: Jenkins CLI for jobs, pipelines, runs
  compatibility: claude-code, codex-cli
---
````
