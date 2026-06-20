---
title: superhacker (cskwork/superhacker-skill)
summary: "보안 목표 하나를 받아 승인(authorization) 게이트를 통과한 뒤, 13개 도메인 중 정확히 하나의 참조 파일로 라우팅하고 최소 영향(least-impact) 순서로 실행하며 재현 가능한 증거 기반 보고서를 산출하는 Claude 보안 스킬."
summary_en: "Accepts one authorized security objective, routes it to exactly one of 13 domain reference files, executes with least-impact ordering, and delivers an evidence-backed report — no scope, no action without written authorization."
tags: [security, ctf, pentest, claude-code, authorized-testing, routing]
source: https://github.com/cskwork/superhacker-skill
author: cskwork
order: 30
trigger: "/superhacker · pentest X · security audit · CTF · red team · incident response · threat hunt"
install: 'git clone https://github.com/cskwork/superhacker-skill && ln -s "$(pwd)/superhacker-skill" ~/.claude/skills/superhacker'
---

## 한 줄

승인된 보안 목표(예: "이 웹앱의 SQLi(SQL 인젝션) 취약점 찾기", "CTF 문제 풀기") 하나를 받아서 13개 도메인 중 정확히 하나의 참조 파일로 라우팅하고, 수동(passive) → 능동(active), 비파괴 → 파괴 순서로 최소 영향 실행한 뒤 재현 가능한 증거와 탐지·조치 가이드를 묶어 보고서로 내는 Claude 스킬.

*EN: One authorized security objective in, an evidence-backed domain report out — routing keeps context tight and prevents cross-domain noise from diluting technique depth.*

## 언제 쓰는가

- 승인된 침투 테스트(pentest) — 서면 범위(RoE, Rules of Engagement)가 있을 때
- CTF(Capture the Flag) 경쟁이나 격리 랩 환경 학습
- 재정보수집(recon) / 웹·API 취약점 분석 / 네트워크 진단 / 클라우드 설정 검토
- IAM(Identity and Access Management) 검토, SIEM(보안 이벤트 관리) 탐지 룰 작성
- 인시던트 리스폰스(incident response, 사고 대응), 포렌식(forensics, 디지털 증거 수집), 멀웨어(malware) 분석
- "compliance(준수) 매핑 — CIS / SOC 2 / ISO 27001" 같은 거버넌스 작업

범위 밖: 소유·승인이 증명되지 않은 시스템에 대한 능동 스캔, 익스플로잇(exploit, 취약점 악용), 자격증명 공격은 하드 스톱(hard stop, 즉시 거부).

## 무엇을 하는가

1. **Scope(범위 확인)** — 목표 + 승인 상태(RoE / 소유 랩 / CTF) + 포스처(offensive·defensive·IR·forensic) 한 줄 수집. 미승인 능동 작업은 즉시 거부.
2. **Frame & Route(분류·라우팅)** — 13개 도메인 라우팅 테이블로 의도를 분류하고, 해당 `reference/*.md` 파일 하나만 로드. 다른 도메인 파일은 로드하지 않아 컨텍스트를 좁게 유지.
3. **Execute(실행)** — 수동 → 능동, 비파괴 → 파괴 순서로 진행. 모든 단계에서 증거(커맨드 + 출력 / 아티팩트 해시 / 스크린샷) 수집.
4. **Verify(검증)** — 모든 발견 사항을 재현해 확인. 미검증 주장은 등급 하향 또는 제거.
5. **Report(보고)** — 심각도(severity) 순 발견 사항 + 재현 방법 + 조치(remediation) + 탐지(detection) 가이드. `templates/report-template.md` 사용.

## 함정

- **승인 없으면 아무것도 없다** — `reference/authorization.md`는 매 호출의 첫 게이트다. CTF나 소유 랩이면 그 사실을 한 줄로 명시해야 스킬이 진행한다.
- **멀티파일 스킬** — `SKILL.md` 하나만 복사하면 `reference/`·`docs/`·`templates/` 디렉터리가 빠져 라우팅이 동작하지 않는다. 위 `install` 명령처럼 repo 전체를 clone하고 symlink(심볼릭 링크)해야 한다.
- **도메인 하나만 로드** — 한 호출에 여러 도메인 참조 파일을 동시에 로드하면 컨텍스트가 오염된다. 새 목표가 생기면 새 호출로 재라우팅.
- **발견 ≠ 주장** — 재현 증거 없는 발견은 보고서에 올리지 않는다. 심각도 인플레이션(severity inflation) 없이 정확하게.

## 원문 — SKILL.md

````markdown
---
name: superhacker
description: Authorized-security routing - scope, classify, and execute security work with least-impact methodology and evidence-backed reporting. Use for "/superhacker", "superhacker", "pentest X", "security audit / find vulnerabilities", "red team", "harden cloud/k8s", "review IAM / zero trust", "detection rules / threat hunt", "incident response", "analyze this malware / forensics", "threat intel", "mobile app security", "compliance / CIS / SOC2", "CTF".
---

# /superhacker - authorized-security routing

One security objective -> route to the right domain -> least-impact execution -> evidence-backed report.

## Core principles

1. **Authorization-first (HARD STOP).** Confirm written scope / rules of engagement before any active or
   intrusive action. Default to passive / read-only. Owned systems, lab, and CTF are self-authorizing -
   state which applies in one line. Active scanning, exploitation, credential attacks, or persistence
   against a system you cannot prove is in-scope: refuse and ask.
2. **Least impact.** Order actions passive->active, non-destructive->destructive. Never DoS, never
   mass-target, never destroy data or establish persistence beyond the agreed scope.
3. **Evidence-based.** Every finding is backed by reproducible evidence (command + output, artifact hash,
   screenshot). A plausible-but-unverified finding is the failure mode - drop or downgrade it.
4. **Defensive purpose.** Offensive technique exists only to improve defense: always deliver detection +
   remediation guidance alongside any exploit finding. Refuse out-of-scope or malicious use (mass
   targeting, crimeware, real-world malware deployment).
5. **Faithful reporting.** Accurate severity (no inflation), clear repro, and an explicit "not tested"
   section so silence is not read as safe.
6. **Output language.** Write prose in the user's language; keep identifiers, commands, tool names, and
   framework IDs in English.

## Engagement loop

1. **Scope.** One line: objective + authorization status (RoE / in-scope targets / allowed actions /
   owned-lab-CTF-vs-client) + posture (offensive / defensive / IR / forensic). Hard stop if active work
   lacks authorization.
2. **Frame & route.** Gather context passively; classify the intent into a domain via the routing table;
   load ONLY that reference file.
3. **Execute (least-impact).** Run the domain workflow passive->active, in-scope only; capture evidence
   as you go.
4. **Verify.** Reproduce every finding (command+output / artifact); rate severity; drop false positives.
   No unverified claims.
5. **Report.** Deliverable = severity-ordered findings report with repro + remediation + detection
   guidance (`templates/report-template.md`).

## Domain routing (classify the intent, state the domain in one line)

| Signal in the objective | Domain | Route |
|---|---|---|
| scope/footprint a target, OSINT, port/service scan, enumerate attack surface, vuln scan + triage, asset discovery | recon (Reconnaissance & Vulnerability Discovery) | `reference/recon.md` |
| test a web app or API, OWASP Top 10, SQLi/XSS/SSRF/IDOR/auth-bypass, GraphQL/REST, WAF behavior | web-api (Web & API Exploitation) | `reference/web-api.md` |
| network pentest, segmentation/VLAN review, IDS/IPS, traffic analysis, OT/ICS protocols (Modbus/DNP3), SCADA | network (Network & OT/ICS Security) | `reference/network.md` |
| red team op, adversary emulation, Active Directory attack paths, privilege escalation, lateral movement, phishing simulation, C2 (authorized) | redteam (Red Team & Adversary Emulation) | `reference/redteam.md` |
| AWS/Azure/GCP hardening, cloud misconfig, Kubernetes/RBAC, image scanning, runtime threat detection, container forensics | cloud-container (Cloud & Container Security) | `reference/cloud-container.md` |
| IAM policy review, least-privilege, PAM, MFA/SSO, zero trust / microsegmentation / BeyondCorp | identity (Identity, Access & Zero Trust) | `reference/identity.md` |
| secure SDLC, CI/CD security, SAST/DAST/SCA, secret scanning, code signing, IaC audit, TLS/crypto/key management | appsec (AppSec, DevSecOps & Cryptography) | `reference/appsec.md` |
| SIEM, log analysis, alert triage, detection rules (Sigma/YARA), threat hunting, LOTL/behavioral analytics, SOC playbooks | soc-detect (SOC, Detection Engineering & Threat Hunting) | `reference/soc-detect.md` |
| CTI, IOC/IOA management, STIX/TAXII, MISP, feed profiling, actor/campaign attribution, intelligence requirements | threat-intel (Threat Intelligence) | `reference/threat-intel.md` |
| active incident, containment/eradication/recovery, ransomware, BEC/phishing response, IR playbooks | incident-response (Incident Response, Ransomware & Phishing) | `reference/incident-response.md` |
| disk/memory imaging, timeline reconstruction, artifact analysis, static/dynamic malware analysis, reverse engineering, sandboxing | forensics (Digital Forensics & Malware Analysis) | `reference/forensics.md` |
| Android/iOS app analysis, mobile pentest, MASVS controls, MDM forensics | mobile (Mobile Security) | `reference/mobile.md` |
| compliance mapping (CIS, SOC 2, ISO 27001, PCI), policy/governance, risk, audit evidence, deception (honeytokens/canaries) | govern (Compliance, Governance & Deception) | `reference/govern.md` |

## Reference map (load only the routed domain)

| Read this | When |
|---|---|
| `reference/authorization.md` | Scope/RoE gate - read at Scope, ALWAYS |
| `reference/recon.md` | Footprinting, OSINT, vuln scanning |
| `reference/web-api.md` | Web/API testing, OWASP Top 10 |
| `reference/network.md` | Network pentest, OT/ICS protocols |
| `reference/redteam.md` | Adversary emulation, AD attack paths |
| `reference/cloud-container.md` | Cloud hardening, K8s/container security |
| `reference/identity.md` | IAM review, zero trust design |
| `reference/appsec.md` | Secure SDLC, CI/CD, crypto/TLS |
| `reference/soc-detect.md` | Detection rules, threat hunting, SOC |
| `reference/threat-intel.md` | CTI, IOC/IOA, actor attribution |
| `reference/incident-response.md` | Active incident, ransomware, BEC |
| `reference/forensics.md` | Disk/memory imaging, malware analysis |
| `reference/mobile.md` | Android/iOS pentest, MASVS |
| `reference/govern.md` | Compliance mapping, governance, deception |

## Final checklist (before claiming done)

- [ ] Authorization confirmed/stated (RoE / owned-lab / CTF)
- [ ] Domain routed and only that reference loaded
- [ ] Least-impact ordering held (passive before active, non-destructive before destructive)
- [ ] Every finding reproduced with evidence (command + output / artifact hash / screenshot)
- [ ] Severity not inflated; "not tested" section explicitly stated
- [ ] Offensive findings paired with detection + remediation guidance
- [ ] Report delivered via `templates/report-template.md`
````
