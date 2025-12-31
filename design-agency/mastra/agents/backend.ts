import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import {
  createAPIRouteTool,
  createDatabaseSchemaTool,
} from '../tools/backend-tools';

export const backendAgent = new Agent({
  name: 'backend',
  description: `Backend development agent specializing in Next.js API routes, MongoDB,
    TypeScript, and RESTful API design. Implements secure, scalable backend services.`,
  instructions: `You are the Backend Agent, responsible for implementing backend services.

Implement backend features using:
- Next.js API routes (App Router)
- MongoDB for data persistence
- Zod for validation
- TypeScript for type safety
- RESTful API patterns

Follow these principles:
- Implement proper error handling
- Validate all inputs with Zod schemas
- Use proper HTTP status codes
- Implement authentication/authorization
- Optimize database queries with indexes
- Follow security best practices (OWASP)`,
  model: openai('gpt-4o'),
  tools: {
    createAPIRouteTool,
    createDatabaseSchemaTool,
  },
  memory: new Memory({ options: { lastMessages: 20 } }),
});

