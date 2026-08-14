---
title: Aside
summary: "에이전트가 내 로그인 세션을 그대로 쓰는 macOS AI 브라우저. API 연동 없이 사람처럼 사이트를 조작해 메일·결제·사내 툴 작업을 대신한다. 자체 모델이 없고 내 ChatGPT·Claude 구독이나 API 키를 꽂아 쓰며, 비밀번호는 에이전트에게 넘기지 않고 페이지에 자동 입력만 한다. 무료 플랜 월 500크레딧, Pro $20/월."
summary_en: "A macOS browser where the agent drives your already-logged-in sessions — no integrations, no APIs. It brings no model of its own: plug in your ChatGPT or Claude subscription, or an API key. Credentials autofill into pages instead of reaching the agent, and payments or posts wait for your confirmation."
tags: [browser, agent-browser, web-automation, password-manager, macos, byo-model]
source: https://aside.com/
author: Aside Computer Inc. (Y Combinator F25)
platforms: [macOS]
order: 13
install: "https://aside.com/download 에서 macOS 빌드 다운로드"
---

## 한 줄

"에이전트를 위한 API를 새로 만드는" 대신, **사람이 쓰는 브라우저를 에이전트에게 그대로 넘기는** 도구. 이미 로그인된 세션 위에서 동작하므로 연동(integration)이 없는 사내 툴·레거시 관리자 페이지도 자동화 대상이 된다.

## 언제 쓰는가

- 공개 API가 없는 웹앱을 에이전트가 대신 조작해야 할 때 (사내 대시보드, 관리자 페이지, 결제 화면)
- 매일 반복하는 웹 작업을 루틴(routine, 정해진 시각에 자동 실행되는 예약 작업)으로 돌리고 싶을 때 — 예: 매일 오전 9시 브리핑
- 모델 구독을 이미 갖고 있어 브라우저 사용료를 따로 내기 싫을 때 (BYO 모델)

## 무엇을 하는가

| 개념 | 내용 |
|---|---|
| Browser agent | 로그인된 사이트를 사람처럼 클릭·입력해 작업 수행. 로컬 파일(문서·스프레드시트)도 다룬다 |
| Password manager | "에이전트를 위한 최초의 비밀번호 관리자". credential(로그인 정보)을 페이지에 autofill(자동 입력)만 하고 모델에게는 노출하지 않으며, 사용 내역을 로그로 남긴다 |
| Memory | 브라우징 기록을 문맥으로 바꿔 재설명을 줄인다. 기기 안에 로컬 보관한다고 명시 |
| Routines | 반복 작업 예약. 푸시 알림을 heartbeat(작업을 깨우는 신호)로 삼아 이벤트에 반응해 이어서 처리 |
| BYO 모델 | 자체 LLM 없음. 내 ChatGPT·Claude 구독 또는 API 키를 연결 |
| 격리 | Secure Enclave 보관, 파일시스템·네트워크 접근을 제한하는 sandbox(격리 실행 공간) |

민감 동작(결제·게시·메시지 발송)은 사용자 확인을 기다린다.

## 가격

```text
Free       $0        월 500 크레딧 · 루틴 최대 3개 · 비밀번호 관리자 · 개인화 메모리
                     (모델은 내 기존 구독/API 키 사용)
Pro        $20/월    Free의 3배 사용량 · 심층 리서치용 Ultrabrowse · 루틴 무제한 · 클라우드 핸드오프
Max        $200/월   Free의 40배 사용량 · 얼리 액세스 프로그램
Enterprise 문의      공유 회사 계정으로 에이전트 실행 · 좌석/청구 중앙 관리 · 권한 제어 ·
                     회사 브라우저 상태(쿠키·기록) 프로비저닝 · 앱/크론에서 실행 트리거
연간 결제 시 20% 할인.
```

## 설치

```text
# macOS 전용. 패키지 매니저 설치 경로 없음 — 공식 다운로드 페이지에서 앱을 받는다.
https://aside.com/download

# 문서 / 변경 이력
https://docs.aside.com
```

## 함정

- **macOS 전용.** Windows 지원은 공식 확인되지 않았다. 크로스 플랫폼 CI에 넣을 헤드리스 자동화 대체제가 아니다.
- **벤치마크 수치는 벤더 자체 발표다.** Online-Mind2Web · BU-Bench-V1 · Odysseys에서 1위(99.0%)라고 주장하지만 방법론 공개나 제3자 검증이 없다. 비교 대상으로 든 모델명 일부도 확인되지 않는다.
- **오픈소스가 아니다.** 코드를 읽고 감사할 수 없으므로 "로컬 보관·post-quantum 암호화" 같은 보안 주장은 벤더 말에 의존한다.
- **내 실계정 세션 위에서 돌아간다**는 건 편의이자 위험이다. 되돌리기 어려운 동작(결제·발송·삭제)은 확인 단계를 반드시 켜두고, 중요하지 않은 계정부터 붙여 범위를 좁혀 시작하라.
- **크레딧제**다. 모델 요금을 내 구독으로 내면서도 브라우저 쪽 크레딧을 따로 소모하므로, 무료 500크레딧으로 실제 워크로드가 감당되는지 먼저 재라.
