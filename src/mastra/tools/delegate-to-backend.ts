/**
 * Tool for delegating tasks to the Backend Agent
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const delegateToBackendTool = createTool({
  id: 'delegate-to-backend',
  description: 'Delegate backend development tasks to the Backend Agent for creating API routes, server actions, and business logic.',
  inputSchema: z.object({
    task: z.string().describe('The backend development task'),
    requirements: z.string().optional().describe('Specific requirements'),
    endpointType: z.enum(['api-route', 'server-action', 'utility', 'middleware']).describe('Type of backend code'),
  }),
  outputSchema: z.object({
    code: z.string().describe('Generated backend code'),
    filePath: z.string().describe('Suggested file path'),
    dependencies: z.array(z.string()).describe('Required dependencies'),
    tests: z.string().optional().describe('Suggested tests'),
  }),
  execute: async ({ context, mastra }) => {
    const { task, requirements, endpointType } = context;
    
    const agent = mastra!.getAgent('backend');
    
    const prompt = `
Backend Task: ${task}
${requirements ? `Requirements: ${requirements}` : ''}
Endpoint Type: ${endpointType}

Create ${endpointType} code following these requirements:
- Use Next.js App Router patterns
- Use TypeScript with proper typing
- Follow functional programming principles
- Include proper error handling and validation
- Use Zod for schema validation where appropriate
- Follow RESTful or Next.js conventions

Provide:
1. Complete code implementation
2. Suggested file path
3. Required dependencies
4. Test suggestions (structure only, not full implementation)
    `.trim();
    
    const result = await agent!.generate(prompt);
    
    return {
      code: result.text,
      filePath: `src/app/api/generated/${endpointType}/route.ts`,
      dependencies: [],
      tests: 'Test outline provided in notes',
    };
  },
});

