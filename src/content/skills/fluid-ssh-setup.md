---
title: fluid-ssh-setup
summary: "Claude Code 같은 AI 코딩 에이전트가 원격 서버나 Kubernetes에 직접 접속해 명령을 실행하게 해주되, 미리 허용한 안전한 조회 명령만 통과시켜 사고를 막아주는 fluid.sh 설치·연결 가이드."
summary_en: "Wire your AI coding agent to remote servers and Kubernetes clusters, with a two-gate allow-list that blocks anything beyond the read-only commands you approve."
tags: [skill, ssh, fluid, mcp, kubernetes, read-only, devops, ncloud]
source: https://github.com/aspectrr/fluid.sh
author: aspectrr (fluid.sh)
license: 원본 저장소 참조
order: 70
trigger: "fluid 설치 / 서버에 SSH 연결 / fluid source prepare 실패 / kubectl을 fluid로 실행 / NCloud NKS 연결"
install: "git clone https://github.com/aspectrr/fluid.sh && cd fluid.sh/fluid-cli && go build -o ~/.local/bin/fluid ./cmd/fluid"
---

## 한 줄

내 컴퓨터의 Claude Code와 원격 서버 양쪽에 `fluid`라는 관문을 설치하고, 명령이 두 관문을 모두 통과할 때만 서버에서 실행되도록 묶어주는 가이드 — 안전한 조회 명령만 지나가고 위험한 명령은 막힌다. 단계 순서를 어기면 어디서 실패하는지 알기 어렵다.

*EN: A step-by-step guide to wiring your AI coding agent to a remote server through two safety gates, so only the read-only commands you allow ever run.*

## 아키텍처

```
[Claude Code] --stdio--> [fluid MCP] --SSH--> [fluid-readonly-shell] --exec--> [kubectl/docker/...]
                            |                        |
                  ~/.mcp.json 등록            서버 측 blocklist 기반
                  config.yaml allowlist       /usr/local/bin/fluid-readonly-shell
```

- **2중 검증:** fluid CLI (로컬 allowlist(허용 목록)) + fluid-readonly-shell (서버 blocklist(차단 목록))
- 기본 허용: `ps`, `ls`, `cat`, `df`, `free` 등 68개 진단 명령어
- 추가 허용: `config.yaml`의 `extra_allowed_commands`로 확장

## 함정

- `go install`은 replace directive(모듈 대체 지시어)로 실패 → 반드시 소스 빌드
- `/usr/local/bin/`에 빌드하면 permission denied → `$HOME/.local/bin/` 사용
- `fluid mcp` 직접 실행은 stdio(표준 입출력) 대기로 hang(응답 없음 상태)처럼 보임 (정상)
- `~/.mcp.json`에 등록 (✗ `~/.claude/.mcp.json`)

## 원문 SKILL.md

````markdown
---
name: fluid-ssh-setup
description: Set up fluid.sh (AI Sys-Admin) for SSH server management and Kubernetes access. Handles installation, SSH config, key deployment, fluid source prepare, MCP registration, and Kubernetes integration. Use when connecting Claude Code to remote servers or Kubernetes clusters via fluid.sh.
---

# fluid-ssh-setup

SSH 서버 관리 및 Kubernetes 클러스터 연동을 위한 fluid.sh 설치/설정 가이드.

## When to Use

- "fluid 설치해줘", "서버에 SSH 연결", "fluid.sh 셋업"
- 원격 서버를 Claude Code에서 관리하고 싶을 때
- fluid source prepare 실패 시 트러블슈팅
- "kubectl을 fluid로 실행", Kubernetes 클러스터 연결

## Setup Workflow

반드시 Phase 순서대로 진행. 각 Phase는 이전 Phase에 의존.

### Phase 1: Install fluid CLI

`go install`은 replace directive 문제로 실패. 반드시 소스에서 빌드:

```bash
cd /tmp && git clone https://github.com/aspectrr/fluid.sh.git fluid-sh
mkdir -p "$HOME/.local/bin"
cd /tmp/fluid-sh/fluid-cli && go build -o "$HOME/.local/bin/fluid" ./cmd/fluid
```

**주의:** `/usr/local/bin/`에 빌드하면 permission denied. 반드시 `$HOME/.local/bin/` 사용.

### Phase 2: SSH Config (CRITICAL)

`~/.ssh/config`에 호스트 등록. publickey를 **첫 번째 인증 방식**으로 지정 — fluid source prepare가 non-interactive로 동작하므로 password-only면 인증 실패.

```
Host <alias>
    HostName <ip-or-domain>
    User <username>
    Port 22
    PreferredAuthentications publickey,password,keyboard-interactive
    IdentityFile ~/.config/fluid/keys/source_ed25519
    IdentityFile ~/.ssh/id_ed25519
```

### Phase 3: SSH Key Deployment (별도 터미널 필수)

```bash
# 1. fluid key 생성 (prepare 한 번 실행하면 자동 생성, 첫 실행은 실패)
~/.local/bin/fluid source prepare <alias>

# 2. 개인 키를 서버에 등록 (비밀번호 입력 필요 - 별도 터미널!)
ssh-copy-id -i ~/.ssh/id_ed25519 <user>@<host-ip>

# 3. fluid 전용 키를 서버에 등록
ssh-copy-id -i ~/.config/fluid/keys/source_ed25519 <user>@<host-ip>
```

**Claude Code 제약:** `ssh-copy-id`는 interactive TTY 필요. Claude Code Bash tool에서는 비밀번호 프롬프트 표시 안 됨 — 반드시 **별도 터미널**에서, 그리고 **로컬 머신**에서 실행 (서버 안에서가 아님).

### Phase 4: fluid source prepare

키 배포 완료 후 다시 실행:

```bash
~/.local/bin/fluid source prepare <alias>
```

이 명령이 원격 서버에 설치하는 것:
1. `/usr/local/bin/fluid-readonly-shell`
2. `fluid-readonly` 시스템 사용자
3. fluid SSH 공개키를 `authorized_keys`에 배포
4. sshd 재시작

확인: `~/.local/bin/fluid source list` → STATUS = `ready`.

### Phase 5: MCP Server 등록

`fluid mcp`는 stdio MCP server. 직접 실행하면 입력 대기로 hang처럼 보이는데 정상. **`~/.mcp.json`에 등록** (`~/.claude/.mcp.json`이 아님):

```json
{
  "mcpServers": {
    "fluid": {
      "command": "/Users/<username>/.local/bin/fluid",
      "args": ["mcp"]
    }
  }
}
```

등록 후 Claude Code **세션 재시작** 필수. `/mcp`에서 fluid server 보이면 성공.

### Phase 6: Config & Security

`~/.config/fluid/config.yaml`이 자동 생성. 주요 설정: `ai_agent.provider`, `ai_agent.api_key`, `ai_agent.model`, `hosts`.

**config.yaml에 api_key가 포함되므로 Claude Code deny 목록에 추가:**

```json
"deny": [
  "Read(**/.config/fluid/config.yaml)",
  "Read(**/config/fluid/config.yaml)",
  "Bash(cat *config/fluid/config.yaml)",
  "Bash(type *config/fluid/config.yaml)",
  "Bash(Get-Content *config/fluid/config.yaml)"
]
```

### Phase 7: Kubernetes 연동 (선택)

#### 7-1. fluid CLI에 kubectl/docker 허용

read-only 모드는 allowlist 기반. `~/.config/fluid/config.yaml` 최상위에:

```yaml
extra_allowed_commands:
  - kubectl
  - docker
```

**변경 후 Claude Code 세션 재시작 필수** (fluid MCP가 시작 시 config 로드).

#### 7-2. kubeconfig 접근 (서버에서 실행)

`fluid-readonly` 사용자가 kubeconfig를 읽을 수 있게 복사:

```bash
sudo cp /home/<k8s-user>/.kube/config /tmp/kubeconfig
sudo chmod 644 /tmp/kubeconfig
```

이후 모든 kubectl에 `--kubeconfig /tmp/kubeconfig` 플래그 필요:

```bash
kubectl --kubeconfig /tmp/kubeconfig get namespaces
```

#### 7-3. Cloud provider authenticator (예: NCloud NKS의 ncp-iam-authenticator)

cloud-specific authenticator를 fluid-readonly 사용자가 실행할 수 있게 복사 (심볼릭 링크는 권한 문제로 실패할 수 있음):

```bash
# 바이너리 복사 (chmod 755)
sudo cp /home/<k8s-user>/bin/<authenticator> /usr/local/bin/<authenticator>
sudo chmod 755 /usr/local/bin/<authenticator>

# cloud 인증 설정 복사
sudo mkdir -p /home/fluid-readonly/.<cloud-config>
sudo cp /home/<k8s-user>/.<cloud-config>/configure /home/fluid-readonly/.<cloud-config>/configure
sudo chown -R fluid-readonly:fluid-readonly /home/fluid-readonly/.<cloud-config>
sudo chmod 600 /home/fluid-readonly/.<cloud-config>/configure
```

## Troubleshooting

| 증상 | 원인 | 해결 |
|------|------|------|
| `go install` 실패 | replace directive | 소스 빌드 (Phase 1) |
| `/usr/local/bin/fluid: permission denied` | 시스템 디렉토리 권한 | `$HOME/.local/bin/`에 빌드 |
| `Could not resolve hostname` | SSH config 미설정 | `~/.ssh/config`에 Host 추가 |
| `Permission denied (publickey,password)` | publickey 인증 비활성 또는 키 미등록 | publickey 우선 + 두 키 모두 배포 |
| `Pseudo-terminal will not be allocated` | Claude Code에서 ssh-copy-id 실행 | 별도 터미널에서 실행 |
| ssh-copy-id에서 `No such file` | 서버 안에서 실행함 | **로컬**에서 실행 |
| `fluid mcp` hang | 정상 (stdio 대기) | `~/.mcp.json`에 등록 후 재시작 |
| `/mcp`에서 fluid 안 보임 | `~/.claude/.mcp.json`에 등록함 | `~/.mcp.json`에 등록 |
| prepare 성공 후 source list 비어있음 | config.yaml sources와 무관 | 내부 DB 등록 — 정상 |
| `kubectl not allowed in read-only mode` | allowlist에 없음 | `extra_allowed_commands` 추가 + 재시작 |
| `localhost:8080 connection refused` | kubeconfig 없음 | 644 권한으로 `/tmp/kubeconfig`에 복사 |
| `authenticator not found` | PATH에 있지만 원본 권한 문제 | `/usr/local/bin/`에 복사 (chmod 755) |
| config 변경 후에도 동일 에러 | MCP가 이전 config로 실행 중 | Claude Code 세션 재시작 |
````
