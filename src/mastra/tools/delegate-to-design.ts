/**
 * Tool for delegating tasks to the Design Agent
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const delegateToDesignTool = createTool({
  id: 'delegate-to-design',
  description: 'Delegate design tasks to the Design Agent for creating UI/UX specifications, component structures, and design guidelines.',
  inputSchema: z.object({
    task: z.string().describe('The design task to perform'),
    requirements: z.string().optional().describe('Specific design requirements'),
    targetPlatform: z.enum(['web', 'mobile', 'desktop']).default('web').describe('Target platform'),
  }),
  outputSchema: z.object({
    designSpec: z.string().describe('Design specification document'),
    components: z.array(z.string()).describe('List of components to create'),
    guidelines: z.string().describe('Design and styling guidelines'),
  }),
  execute: async ({ context, mastra }) => {
    const { task, requirements, targetPlatform } = context;
    
    const agent = mastra!.getAgent('design');
    
    const prompt = `
Design Task: ${task}
${requirements ? `Requirements: ${requirements}` : ''}
Target Platform: ${targetPlatform}

Please create design specifications including:
1. Overall design approach and principles
2. Component structure and hierarchy
3. Styling guidelines (TailwindCSS classes, color schemes, typography)
4. Accessibility considerations

Format your response with clear sections.
    `.trim();
    
    const result = await agent!.generate(prompt);
    
    return {
      designSpec: result.text,
      components: [],
      guidelines: result.text,
    };
  },
});

