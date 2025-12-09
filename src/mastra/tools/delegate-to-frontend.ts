/**
 * Tool for delegating tasks to the Frontend Agent
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const delegateToFrontendTool = createTool({
  id: 'delegate-to-frontend',
  description: 'Delegate frontend development tasks to the Frontend Agent for creating React components, pages, and client-side logic.',
  inputSchema: z.object({
    task: z.string().describe('The frontend development task'),
    designSpec: z.string().optional().describe('Design specification to follow'),
    componentType: z.enum(['page', 'component', 'layout', 'hook']).describe('Type of code to generate'),
  }),
  outputSchema: z.object({
    code: z.string().describe('Generated frontend code'),
    filePath: z.string().describe('Suggested file path'),
    dependencies: z.array(z.string()).describe('Required dependencies'),
    notes: z.string().optional().describe('Implementation notes'),
  }),
  execute: async ({ context, mastra }) => {
    const { task, designSpec, componentType } = context;
    
    const agent = mastra!.getAgent('frontend');
    
    const prompt = `
Frontend Task: ${task}
${designSpec ? `Design Specification: ${designSpec}` : ''}
Component Type: ${componentType}

Create ${componentType} code following these requirements:
- Use React 19 with functional components
- Use TypeScript with proper typing
- Apply TailwindCSS for styling with shadcn/ui components where appropriate
- Follow React Server Components patterns when applicable
- Use functional programming principles
- Include proper error handling

Provide the complete code with:
1. The code itself
2. Suggested file path
3. Any required dependencies
4. Implementation notes
    `.trim();
    
    const result = await agent!.generate(prompt);
    
    return {
      code: result.text,
      filePath: `src/components/generated/${componentType}.tsx`,
      dependencies: [],
      notes: result.text,
    };
  },
});

