/**
 * Tool for delegating tasks to the Deep Research Agent
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const delegateToResearchTool = createTool({
  id: 'delegate-to-research',
  description: 'Delegate research tasks to the Deep Research Agent for gathering information, analyzing documentation, and providing insights.',
  inputSchema: z.object({
    task: z.string().describe('The research task to perform'),
    context: z.string().optional().describe('Additional context for the research'),
    depth: z.enum(['quick', 'standard', 'deep']).default('standard').describe('How thorough the research should be'),
  }),
  outputSchema: z.object({
    findings: z.string().describe('Research findings and insights'),
    sources: z.array(z.string()).describe('Sources consulted'),
    recommendations: z.string().optional().describe('Recommendations based on research'),
  }),
  execute: async ({ context, mastra }) => {
    const { task, context: taskContext, depth } = context;
    
    const agent = mastra!.getAgent('deepResearch');
    
    const prompt = `
Research Task: ${task}
${taskContext ? `Context: ${taskContext}` : ''}
Depth Level: ${depth}

Please conduct ${depth} research on this topic and provide:
1. Key findings and insights
2. Relevant sources and references
3. Actionable recommendations

Format your response as structured data.
    `.trim();
    
    const result = await agent!.generate(prompt);
    
    // Parse the result (in production, you'd want more robust parsing)
    return {
      findings: result.text,
      sources: [],
      recommendations: result.text,
    };
  },
});

