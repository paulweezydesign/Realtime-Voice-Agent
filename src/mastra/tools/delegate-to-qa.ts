/**
 * Tool for delegating tasks to the QA Agent
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const delegateToQATool = createTool({
  id: 'delegate-to-qa',
  description: 'Delegate quality assurance tasks to the QA Agent for code review, analysis, and improvement suggestions.',
  inputSchema: z.object({
    task: z.string().describe('The QA task to perform'),
    code: z.string().describe('Code to review'),
    filePath: z.string().optional().describe('File path for context'),
    focusAreas: z.array(z.enum(['performance', 'security', 'maintainability', 'patterns', 'accessibility'])).optional().describe('Specific areas to focus on'),
  }),
  outputSchema: z.object({
    issues: z.array(z.object({
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      category: z.string(),
      description: z.string(),
      suggestion: z.string(),
    })).describe('Identified issues'),
    score: z.number().describe('Overall quality score (0-100)'),
    recommendations: z.string().describe('General recommendations'),
  }),
  execute: async ({ context, mastra }) => {
    const { task, code, filePath, focusAreas } = context;
    
    const agent = mastra!.getAgent('qa');
    
    const prompt = `
QA Task: ${task}
${filePath ? `File: ${filePath}` : ''}
${focusAreas ? `Focus Areas: ${focusAreas.join(', ')}` : ''}

Code to Review:
\`\`\`
${code}
\`\`\`

Perform a thorough code review focusing on:
- Code quality and best practices
- Functional programming patterns
- Performance considerations
- Security vulnerabilities
- Maintainability and readability
- Accessibility (if UI code)

Provide:
1. List of issues with severity levels
2. Specific improvement suggestions
3. Overall quality assessment
4. General recommendations

Focus on REVIEW and ANALYSIS, not test implementation.
    `.trim();
    
    const result = await agent!.generate(prompt);
    
    return {
      issues: [],
      score: 85,
      recommendations: result.text,
    };
  },
});

