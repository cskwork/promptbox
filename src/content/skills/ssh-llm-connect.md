---
title: ssh-llm-connect
summary: "AI 에이전트가 원격 서버 로그·상태를 읽을 때 `rm`, `sudo`, 서비스 재시작 같은 위험 명령은 자동 차단하고, 접속 자격증명은 코드 밖에 보관한다."
summary_en: "Lets your AI agent SSH in to read logs and status — destructive commands blocked, credentials kept out of the code."
tags: [skill, ssh, security, claude-code, pre-tool-hook, read-only, guard]
source: https://github.com/cskwork/ssh-llm-connect
author: cskwork
license: MIT
order: 60
trigger: "SSH to prod / 에이전트 원격 접속 / read-only ssh / claude-code ssh guard / ssh-llm-connect"
install: "git clone https://github.com/cskwork/ssh-llm-connect && cd ssh-llm-connect && ./install.sh /path/to/your/project"
---

## 한 줄

AI 에이전트가 `ssh user@host "rm -rf ..."` 같은 위험한 명령을 직접 칠 수 있는 환경에서, **에이전트가 우회할 수 없는** 3중 차단(에이전트가 손댈 수 없는 사전 검사 + 읽기 전용 가드 + 비밀번호·키 분리 보관)으로 *정직한 실수*를 막는다.

*EN: Guardrails against an AI agent's honest mistakes when it can run shell commands on a real server — not a sandbox.*

## 이것은 무엇이 *아닌가*

- **샌드박스 아님.** 클라이언트에 root가 있는 악의적 행위자는 못 막는다.
- **서버 사이드 하드닝(서버 보안 강화) 대체 아님.** 진짜 격리는 `ForceCommand` + `authorized_keys` + `rbash` + 전용 read-only(읽기 전용) SSH 유저.

"AI 에이전트의 정직한 실수에 대한 가드레일" — 그것만으로도 가치 있다.

## 4겹 방어

| Layer | 강제 주체 | 막는 것 |
|---|---|---|
| 1 PreToolUse 훅 | Claude Code 하네스 (에이전트 우회 불가) | 직접 `ssh`/`scp`/`sftp` 호출, bypass(우회) 플래그 |
| 2 `permissions.deny` in `settings.json` | Claude Code 하네스 | bypass 플래그 (belt + suspenders, 이중 안전장치) |
| 3 `connect.sh` read-only 가드 | 헬퍼 스크립트 | `rm`/`sudo`/redirect(출력 방향 전환)/systemctl write/`curl -X POST`/패키지 설치/`-c` |
| 4 서버 사이드 (사용자가 제공) | `sshd_config`/`authorized_keys` | 그 외 모든 것 |

## 설치

```bash
git clone https://github.com/cskwork/ssh-llm-connect.git
cd ssh-llm-connect
./install.sh /path/to/your/project
```

설치 스크립트가 하는 것:

- `bin/connect.sh` → `<project>/ssh/connect.sh`
- `hosts/_template.env` → `<project>/ssh/hosts/_template.env`
- `hooks/ssh-guard.sh` → `<project>/.claude/hooks/ssh-guard.sh`
- `/ssh/hosts/*.env`를 `<project>/.gitignore`에 추가 (자격증명 commit 방지)
- `<project>/.claude/settings.json`에 붙일 스니펫 출력 (직접 paste; 설치기는 agent config를 자동 편집하지 않음)

## 호스트 추가

```bash
cp ssh/hosts/_template.env ssh/hosts/prod-app.env
$EDITOR ssh/hosts/prod-app.env
```

최소 필드:

```env
SSH_HOST=10.0.0.10
SSH_PORT=22
SSH_USER=deploy
SSH_KEY_PATH=~/.ssh/id_ed25519        # 또는 SSH_PASSWORD=... (sshpass 필요)
```

선택: `SSH_PROXY_JUMP`, `SSH_LOCAL_FORWARD`, `SSH_REMOTE_FORWARD`, `SSH_EXTRA_OPTS`.

## 사용

```bash
# 기본 — read-only 강제
./ssh/connect.sh prod-app "tail -100 /var/log/app.log"
./ssh/connect.sh prod-app "ps aux | grep java"

# 거부됨
./ssh/connect.sh prod-app "rm /tmp/x"
./ssh/connect.sh prod-app "echo hi > /tmp/x"
./ssh/connect.sh prod-app "systemctl restart app"

# 우회 (사람만 — 에이전트는 훅이 차단)
./ssh/connect.sh --shell prod-app
./ssh/connect.sh --allow-write prod-app "systemctl restart app"
```

## 한계

- **패턴 기반**: 결정적 공격자는 base64·eval로 우회 가능. 훅은 표면을 좁힐 뿐
- **클라이언트 사이드만**: Bash 채널 한정. 에이전트 하네스가 Python `paramiko` 같은 비-Bash 네트워크 프리미티브를 허용하면 훅이 못 봄. agent settings에서 따로 deny
- **훅 등록은 수동**: 설치기는 `settings.json`을 자동 편집하지 않음 (그 파일은 agent 권한을 통제하므로 silent 수정 거부)

## SKILL 포맷 (이 항목 자체를 SKILL.md로 쓸 사람용)

````markdown
---
name: ssh-llm-connect
description: Use the guarded ssh/connect.sh wrapper to inspect remote logs, processes, metrics, or configuration when the agent must not issue remote writes.
---

# ssh-llm-connect

## Before the first remote command
Confirm the guard is installed and registered:
```bash
ls ssh/connect.sh .claude/hooks/ssh-guard.sh && grep -l ssh-guard.sh .claude/settings*.json
```
If either check fails, treat the Bash channel as unguarded — say so and have the user
run `install.sh` (below) before any SSH.

## Running commands
Every remote command goes through `./ssh/connect.sh <host-slug> "<command>"`, which
enforces the read-only guard (Layer 3). The PreToolUse hook rejects `ssh`/`scp`/`sftp`
called directly and surfaces why.

When the guard refuses a command, relay the rule that fired and ask the user to run it
from their own terminal. `--allow-write` and `--shell` are human-only bypass flags — the
hook rejects them from the agent.

An unknown slug makes connect.sh print `Error: <path> not found` and list the registered
host slugs; pick from that list.

## Defense layers
| Layer | Enforced by                  | Blocks |
| ----- | ---------------------------- | --------------------------------------------------------- |
| 1     | PreToolUse hook (harness)    | direct ssh/scp/sftp, bypass flags |
| 2     | permissions.deny in settings | bypass flags (belt + suspenders) |
| 3     | connect.sh read-only guard   | rm/sudo/redirect/systemctl write/curl POST/pkg install/-c |
| 4     | server-side (user provides)  | everything else |

## Read-only command rules (Layer 3, summary)
Refused: sudo, su, rm, mv, cp, dd, mkfs, chmod, chown, kill, reboot, passwd,
useradd, mount, iptables, crontab, tee, wget, scp, rsync, eval, exec, source,
`>`, `>>`, `sed -i`, systemctl write subcommands, git push|commit|reset|clean|
checkout|switch|rebase|merge, package managers install|upgrade|update|remove,
curl -X POST|PUT|PATCH|DELETE | -o | -O | --data, language interpreters with -c.

Allowed (by being not refused): cat, ls, grep, awk, sed (no -i), head, tail, wc,
sort, uniq, cut, tr, find, which, env, echo, date, uptime, free, df, du, ps,
top, netstat, ss, ip, hostname, uname, id, whoami, journalctl (read), systemctl
status, git log|status|diff|show, docker ps|logs, kubectl get|describe|logs.

## Host config
ssh/hosts/<slug>.env:
  SSH_HOST=10.0.0.10
  SSH_PORT=22
  SSH_USER=deploy
  SSH_KEY_PATH=~/.ssh/id_ed25519           # or SSH_PASSWORD=... (needs sshpass)
  SSH_PROXY_JUMP=jumpbox                   # optional
  SSH_LOCAL_FORWARD=8080:127.0.0.1:8080    # optional (also SSH_REMOTE_FORWARD, SSH_EXTRA_OPTS)

## Install (per project — run once per repo that needs SSH)
```bash
git clone https://github.com/cskwork/ssh-llm-connect.git
./ssh-llm-connect/install.sh /path/to/your/project
```
Copies `connect.sh` → `<project>/ssh/connect.sh`, `_template.env` → `<project>/ssh/hosts/`,
the hook → `<project>/.claude/hooks/ssh-guard.sh`, gitignores `/ssh/hosts/*.env`, and prints a
settings.json snippet for you to paste (it does not edit agent config itself).
````
