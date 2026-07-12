---
title: Hiring Agent
summary: "이력서 PDF를 넣으면 구조화 데이터 추출 → GitHub 활동 보강 → 공정성 기반 평가·점수화까지 자동 수행하는 AI 에이전트. Ollama(로컬) 또는 Gemini로 동작하며, 카테고리별 점수·근거·보너스·감점을 설명 가능한 형태로 출력한다. HackerRank(interviewstreet)가 만들었다."
summary_en: "AI agent that evaluates and scores resumes — PDF parsing, GitHub enrichment, and fair, explainable scoring. Runs locally on Ollama or on Google Gemini."
tags: [hiring, resume, evaluation, hr, ollama, gemini, pdf, github, ai-agent]
source: https://github.com/interviewstreet/hiring-agent
author: interviewstreet (HackerRank)
license: MIT
languages: [Python]
platforms: [macOS, Linux, Windows]
order: 90
install: "git clone https://github.com/interviewstreet/hiring-agent.git && cd hiring-agent && pip install -r requirements.txt"
---

## 한 줄

이력서 PDF를 넣으면 점수와 평가를 내주는 AI 에이전트. PDF → Markdown 변환 → 섹션별 JSON 추출(경력, 학력, 기술, 프로젝트) → GitHub 프로필·레포지토리 보강 → 공정성 규칙이 적용된 평가(오픈소스, 자기 프로젝트, 프로덕션 경험, 기술 역량)까지 자동으로 수행한다. HackerRank(코딩 테스트 플랫폼) 운영사인 interviewstreet가 만들었다.

## 언제 쓰는가

- 채용 담당자나 헤드헌터가 이력서를 객관적 기준으로 일관되게 평가해야 할 때
- 스타트업이 채용 시 인적 편향을 줄이고, GitHub 활동 같은 객관적 신호를 평가에 반영하고 싶을 때
- 다수의 이력서를 빠르게 스크리닝하여 후보를 좁혀야 할 때
- Ollama(로컬 LLM 런타임)로 민감한 이력서 데이터를 외부 API에 보내지 않고 평가하고 싶을 때

## 무엇을 하는가

| 단계 | 내용 |
|------|------|
| PDF 추출 | PyMuPDF로 PDF 페이지를 Markdown 텍스트로 변환 |
| 섹션 파싱 | Jinja 템플릿으로 Basics/Work/Education/Skills/Projects/Awards를 구조화 JSON으로 추출 |
| GitHub 보강 | 이력서에서 GitHub 사용자명 추출 → 프로필·레포 fetch → 프로젝트 분류 → LLM이 상위 7개 프로젝트 선정 |
| 평가 | 오픈소스, 자기 프로젝트, 프로덕션 경험, 기술 역량 카테고리별 점수 + 보너스 + 감점 + 근거 |
| 출력 | 터미널 요약 + CSV 내보내기(개발 모드) |
| 캐싱 | 중간 JSON 결과를 `cache/`에 저장하여 반복 실행 최적화 |

## 설치

```text
git clone https://github.com/interviewstreet/hiring-agent.git
cd hiring-agent

python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# .env 설정
cp .env.example .env
# LLM_PROVIDER=ollama (또는 gemini)
# DEFAULT_MODEL=gemma3:4b

# Ollama 모델 풀
ollama pull gemma3:4b

# 실행
python score.py /path/to/resume.pdf
```

## 함정

- 평가 기준이 개발자 중심이다 — 오픈소스, 자기 프로젝트, 프로덕션, 기술 역량 4개 카테고리로, 비개발 직군(디자인, 영업, 마케팅) 이력서에는 적합하지 않다.
- LLM 기반 추출이므로, PDF 품질이 낮거나 비표준 레이아웃이면 섹션 파싱 오류가 발생할 수 있다.
- GitHub 보강은 이력서에 GitHub 사용자명이 명시된 경우에만 작동한다. 없으면 평가에서 GitHub 신호가 누락된다.
- 74 커밋, 비교적 초기 프로젝트 — 기능은 단일(단일 이력서 평가)하고, 배치 처리·웹 UI 등은 직접 구현해야 한다.
- Ollama 모델 선택에 따라 평가 품질이 크게 달라진다. `gemma3:4b`는 가볍지만 정확도가 낮을 수 있고, `gemma3:12b`는 더 나은 결과지만 더 많은 리소스가 필요.
