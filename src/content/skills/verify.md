---
title: verify
title_en: Verify
summary: "초록 빌드를 검증으로 인정하지 않는 스킬. 빌드·정적검사·클린코드·시나리오 API QA·보고 5개 게이트를 순서대로 돌리고, 게이트마다 남이 그대로 재실행할 수 있는 증거 파일(receipt)을 디스크에 남긴다. 판정은 PASS·FAIL·BLOCKED 세 가지이며, 실행하지 못한 게이트는 절대 PASS가 되지 않는다."
summary_en: "Refuses to call a green build verified. Runs five gates in order — build, static checks, clean-code review of the diff, scenario-based API QA, report — and each one ends on a receipt file another person can re-run. Three verdicts: PASS, FAIL, and BLOCKED. A gate that could not run never reads as green."
tags: [skill, verification, qa, api-testing, curl, jwt, payload-variants, receipts, code-review, agent-skills, claude-code, codex]
source: https://github.com/cskwork/verify-skill
author: cskwork
license: MIT
order: 30
trigger: "최근 작업 검증 / 검증해줘 / 빌드는 됐는데 진짜 동작하는지 / API 시나리오 테스트 / 머지·배포해도 되나 / 검증 보고서"
install: "git clone https://github.com/cskwork/verify-skill.git ~/.claude/skills/verify"
---

## 한 줄

빌드 성공은 **컴파일러가 만족했다는 증거**일 뿐이다. 엔드포인트가 실제 payload를 받는지, 쿼리가 맞는 행을 돌려주는지, 변경이 호출자를 깨뜨리지 않았는지는 증명하지 않는다. 이 스킬은 그 간극을 **receipt**로 메운다 — 남이 그대로 재실행해 같은 판정에 도달할 수 있는 파일. receipt가 없으면 통과도 없다.

*EN: A green build proves the compiler was satisfied. `verify` closes the gap with receipts — files another person can re-run to reach the same verdict.*

## 5개 게이트

| # | 게이트 | 묻는 것 | receipt |
|---|--------|---------|---------|
| 1 | 빌드 | 변경한 코드가 컴파일되는가 | 명령·exit code·출력 끝부분 |
| 2 | 정적검사 | 이 레포가 **이미 쓰는** 타입·린트·스키마 검사를 통과하는가 | 도구별 exit code·지적 건수 |
| 3 | 클린코드 | 이 diff를 승인할 수 있는가 (diff만 본다) | 변경 파일당 한 줄, 없으면 `none` 명시 |
| 4 | 시나리오 | 변경이 닿은 각 API가 **실제로** 동작하는가 | 변형별 요청·응답 원문 |
| 5 | 보고 | 동료가 읽고 무엇이 증명됐는지 아는가 | 한 장짜리 `report.md` |

## 판정 3종 — 세 번째가 핵심

- **PASS** — 실행했고 receipt가 기대한 결과를 보여준다.
- **FAIL** — 실행했고 receipt가 잘못된 무언가를 보여준다.
- **BLOCKED** — 실행하지 못했다. 자격증명 없음, 의존 서비스 불가, 런타임 부재.

`BLOCKED`는 절대 `PASS`가 아니다. 건너뛴 게이트가 초록으로 보이는 것이 이 스킬이 막으려는 실패다. 기존에 이미 깨져 있던 실패와 이번 diff가 만든 회귀도 반드시 분리한다.

## 재사용 토큰 모듈

보호된 엔드포인트에는 자격증명이 필요하고, API 검증이 멈추는 지점은 대개 여기다.

```bash
TOKEN=$(scripts/token.sh)      # 신선하면 캐시, 아니면 발급
scripts/token.sh --header      # "Authorization: Bearer <token>"
scripts/token.sh --refresh     # 401 이후 강제 재발급
scripts/token.sh --status      # 캐시 상태만 확인
```

5개 모드 — `static`, `http_get`, `http_post_json`, `http_post_form`, `command`. 마지막이 만능 탈출구다(브라우저 로그인 스크립트, OAuth device flow, `aws sts`, 오프라인 서명 스크립트).

**신원별로 캐시한다.** 변형 30개 suite가 로그인 1회로 끝나고, 관리자에서 일반 사용자로 바꿀 때 관리자 토큰을 조용히 재사용하지 않는다. 자격증명은 디스크에 닿기 전에 마스킹된다.

## payload 변형 매트릭스

호출 한 번은 거의 아무것도 증명하지 않는다. 엔드포인트당 **최소 3종**이 바닥이다.

| 변형 | 증명하는 것 |
|------|-------------|
| `happy` | 실제 유효한 payload에서 문서화된 계약이 지켜진다 |
| `boundary` | 빈 값·최댓값·null·유니코드 경계가 동작한다 |
| `negative` | 잘못된 입력이 **500이 아니라 4xx**로 거절된다 |
| `regression` | 버그 리포트의 그 payload가 이제 통과한다 (버그 수정 시) |
| `authz` | 잘못된 역할·테넌트의 같은 호출이 거절된다 (권한 변경 시) |

payload 출처는 4단계 사다리를 순서대로 밟는다 — 사용자 제공 → 저장된 fixture → **실제 DB 행** → 합성. 보고서는 어느 단계까지 갔는지 밝힌다. 합성 payload는 계약이 아니라 당신의 상상을 시험하기 때문이다.

시나리오는 JSON이라 재실행이 몇 초다.

```json
{
  "endpoint": "GET /api/items",
  "auth": "required",
  "variants": [
    { "name": "happy", "path": "/api/items", "query": { "limit": 3 },
      "expect": { "status": 200, "jq": [".data.total == 3"] }, "source": "db-row" }
  ]
}
```

## 역할 커버리지 — 가장 놓치기 쉬운 간극

역할이 여러 개인 변경에서는 **역할마다 그 역할의 실계정 + 그 역할의 엔드포인트**가 필요하다.

토큰의 role claim만 바꾼 `authz` 변형은 "가드가 거부한다"만 증명한다. 그 역할의 화면은 **전혀** 검증되지 않는다 — 호출한 적이 없고, 토큰 뒤의 계정도 실제로 그 역할이 아니다. 계정을 못 찾으면 그 역할은 `BLOCKED`이고, 보고서에 어떤 계정이 있으면 풀리는지 적는다.

## 환경 사다리

| 환경 | 읽기 | 쓰기 |
|------|------|------|
| local, dev | 기본 | 엔드포인트 목록 승인 후 |
| staging, audit | 명시 지시가 있을 때만 | 같은 지시에서 엔드포인트 단위 승인 |
| production | **never** | **never** |

문서로만 두지 않는다. `VERIFY_FORBIDDEN_HOSTS`를 adapter에 적으면 `lib.sh`의 `vf_guard_target`이 `call.sh`·`token.sh`·health poll 세 지점에서 **curl 실행 전에** 거부한다. 되돌릴 수 없는 실수를 막는 유일한 가드다.

"로컬"도 자동으로 안전하지 않다. dev 프로필은 보통 공유 DB를 가리키므로, 로컬 프로세스가 공유 데이터를 쓴다.

## 보고는 wait-what 스타일

게이트 5가 최종 산출물이다. 제대로 검증했어도 설명이 나쁘면 읽는 사람은 여전히 감을 못 잡는다. 전제는 하나 — **읽는 사람은 맥락을 놓쳤다**.

- 요약이 아니라 **다시 설명**한다. 판정을 먼저, 증거를 뒤에.
- 단순화 기술영어(ASD-STE100). 한 문장에 한 생각, 능동태, 정의하지 않은 전문용어 금지.
- **프로젝트의 어휘**를 쓴다 — `CONTEXT.md`·용어집·ADR의 표제어.

가장 값진 절은 "검증하지 않은 것"이다.

```markdown
## 검증하지 않은 것
1. 관리자 화면. 데이터가 있는 관리자 계정이 없었다.
```

간극을 숨긴 보고서를 한 번 믿은 사람은 그 뒤로 보고서를 믿지 않는다.

## adapter — 스택 분리

게이트는 스택에 의존하지 않는다. adapter 파일 하나가 게이트로는 알 수 없는 사실 6개를 담는다.

```bash
cp adapters/_template.env /path/to/repo/.verify/adapter.env
```

| 사실 | 키 |
|------|-----|
| 빌드 명령 | `VERIFY_BUILD_CMD` |
| 검사 목록 | `VERIFY_STATIC_CMDS` |
| 기동 방법 | `VERIFY_RUN_CMD`, `VERIFY_BASE_URL` |
| 기동 확인 | `VERIFY_HEALTH_PATH` |
| 토큰 발급 | `VERIFY_TOKEN_MODE` 계열 |
| 테스트 계정 | `VERIFY_ACCOUNT_HOWTO` |

`adapters/spring-mybatis.md`는 실제 Spring Boot 3 + MyBatis 서비스에 돌리며 얻은 **함정 7개**를 담은 완성 예시다. 전부 명확한 에러가 아니라 **잘못된 판정**을 만드는 종류다 — 관리 포트를 health로 잡기, IDE가 `build/`를 동시에 써서 컴파일 실패, 토큰 발급 엔드포인트가 토큰을 요구하는 순환, MyBatis XML은 첫 호출에서만 깨짐, **포트에 이미 떠 있는 프로세스가 내 코드가 아닌 경우**, "로컬"이 공유 DB인 경우, 4xx 계약이 500으로 나가는 경우.

## 하네스 자체를 검증한다

```bash
scripts/selftest.sh     # 임시 서버로 5개 게이트 + 하네스 판별력 22개 항목
```

가장 값진 것은 **부정 검사**다 — 기대 status가 틀리면 FAIL이 나오는지, 기대값을 안 적은 변형이 통과하지 않는지, 금지 호스트가 거부되는지. 이것이 하네스가 판별력을 가졌다는 증거이고, 초록 결과를 믿을 유일한 근거다.

이 검사들을 쓰면서 실제 결함 3건을 잡았다.

1. **마스킹 유출** — BSD `sed`는 bracket 안 이스케이프가 없어 `[^\r]`을 "backslash 아님, r 아님"으로 읽는다. `Authorization: Bearer secret-r-value`가 `<REDACTED>rer secret-r-value`로 새어나갔다. GNU sed에서는 통과하므로 Linux CI에서 안 잡힌다.
2. **stdin 삼킴** — gradle이 검사 목록 heredoc을 먹어서 두 번째 검사가 조용히 실행되지 않았고, 게이트는 PASS를 보고했다.
3. **adapter 미로딩** — `VERIFY_BASE_URL` 없이 health를 폴링했다.

## 설치

```bash
# 전역 (모든 CLI 공용)
git clone https://github.com/cskwork/verify-skill.git ~/.agents/skills/verify

# Claude Code 단독
git clone https://github.com/cskwork/verify-skill.git ~/.claude/skills/verify

cd ~/.claude/skills/verify && scripts/selftest.sh   # 22/22 확인
```

`curl`·`jq`·`bash`만 필요하다. bash 3.2 호환으로 작성해 macOS 기본 셸에서 검증했다.

## 언제 쓰지 않는가

- 문서·주석만 바뀐 커밋
- HTTP 계약에 영향 없는 설정 변경
- 프론트엔드 전용 diff (브라우저 QA는 별도 스킬)

## 링크

- 레포: <https://github.com/cskwork/verify-skill>
- 한/영 소개: <https://cskwork.github.io/verify-skill/>
- 예시 보고서: <https://github.com/cskwork/verify-skill/blob/main/docs/example-report.md>
- 보고 스타일 원안: [`wait-what`](https://github.com/mattpocock/skills/tree/main/skills/productivity/wait-what) by Matt Pocock
