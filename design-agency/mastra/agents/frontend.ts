import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import {
  generateComponentTool,
  implementPageTool,
} from '../tools/frontend-tools';

export const frontendAgent = new Agent({
  name: 'frontend',
  description: `Frontend development agent specializing in React 19, Next.js 15, TypeScript,
    TailwindCSS, and shadcn/ui. Implements designed components and pages with best practices.`,
  instructions: `You are the Frontend Agent, responsible for implementing user interfaces.

Implement components and pages using:
- React 19 with Server Components
- TypeScript for type safety
- TailwindCSS for styling
- shadcn/ui for component patterns
- Accessibility best practices (WCAG 2.1 AA)

Follow these principles:
- Use Server Components by default, Client Components only when needed
- Implement responsive designs (mobile-first)
- Ensure semantic HTML and accessibility
- Optimize for performance (lazy loading, code splitting)
- Follow design system specifications exactly`,
  model: openai('gpt-4o'),
  tools: {
    generateComponentTool,
    implementPageTool,
  },
  memory: new Memory({ options: { lastMessages: 20 } }),
});

