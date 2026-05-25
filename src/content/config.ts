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

export const collections = { prompts, skills, configs, mcps, plugins };

export const CATEGORY_META = {
  prompts: { label: '프롬프트', description: '바로 복사해 쓰는 프롬프트 템플릿' },
  skills: { label: '스킬', description: 'Claude Code · Codex · Hermes용 SKILL.md 컬렉션' },
  configs: { label: '설정 파일', description: 'CLAUDE.md · AGENTS.md 등 에이전트 시스템 프롬프트' },
  mcps: { label: 'MCP', description: 'MCP 서버 설정 스니펫' },
  plugins: { label: '플러그인', description: '여러 SKILL/툴을 묶은 코딩 에이전트 플러그인·마켓플레이스' },
} as const;

export type CategoryKey = keyof typeof CATEGORY_META;
