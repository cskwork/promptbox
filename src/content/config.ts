import { defineCollection, z } from 'astro:content';

const baseFields = {
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  source: z.string().url().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  order: z.number().default(100),
  hidden: z.boolean().default(false),
};

const prompts = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    use_case: z.string().optional(),
  }),
});

const skills = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    trigger: z.string().optional(),
    install: z.string().optional(),
  }),
});

const configs = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    target_file: z.string().optional(),
    tools: z.array(z.string()).default([]),
  }),
});

const mcps = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    server_name: z.string().optional(),
    transport: z.enum(['stdio', 'sse', 'http']).optional(),
  }),
});

const plugins = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    harnesses: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

const hooks = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    event: z.string().optional(),
    matcher: z.string().optional(),
    scope: z.enum(['project', 'global', 'both']).optional(),
    deps: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

const harnesses = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    base_agent: z.string().optional(),
    languages: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    languages: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

export const collections = { prompts, skills, configs, mcps, plugins, hooks, harnesses, tools };

export const CATEGORY_META = {
  prompts: { label: '프롬프트', description: '바로 복사해 쓰는 프롬프트 템플릿' },
  skills: { label: '스킬', description: 'Claude Code · Codex · Hermes용 SKILL.md 컬렉션' },
  configs: { label: '설정 파일', description: 'CLAUDE.md · AGENTS.md 등 에이전트 시스템 프롬프트' },
  mcps: { label: 'MCP', description: 'MCP 서버 설정 스니펫' },
  plugins: { label: '플러그인', description: '여러 SKILL/툴을 묶은 코딩 에이전트 플러그인·마켓플레이스' },
  hooks: { label: '훅', description: 'PreToolUse · PostToolUse · Stop 등 에이전트 라이프사이클 훅 스크립트' },
  harnesses: { label: '하네스', description: '코딩 에이전트 그 자체 — Codex CLI · Claude Code · Pi 위에 얹는 워크플로우/툴 레이어' },
  tools: { label: '도구', description: '코딩 에이전트 작업을 보조하는 CLI · 데스크톱 앱 · 인덱서' },
} as const;

export type CategoryKey = keyof typeof CATEGORY_META;
