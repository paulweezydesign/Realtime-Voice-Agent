/**
 * Tool for delegating tasks to the Client Acquisition Team
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const delegateToClientTeamTool = createTool({
  id: 'delegate-to-client-team',
  description: 'Delegate client acquisition tasks for finding prospects, creating proposals, and onboarding documentation.',
  inputSchema: z.object({
    task: z.string().describe('The client acquisition task'),
    taskType: z.enum(['prospect-research', 'proposal', 'onboarding', 'presentation']).describe('Type of task'),
    clientInfo: z.string().optional().describe('Information about the client or prospect'),
  }),
  outputSchema: z.object({
    content: z.string().describe('Generated content (proposal, documentation, etc.)'),
    nextSteps: z.array(z.string()).describe('Recommended next steps'),
    materials: z.array(z.string()).describe('Supporting materials or documents created'),
  }),
  execute: async ({ context, mastra }) => {
    const { task, taskType, clientInfo } = context;
    
    const agent = mastra!.getAgent('clientAcquisition');
    
    const prompt = `
Client Acquisition Task: ${task}
Task Type: ${taskType}
${clientInfo ? `Client Information: ${clientInfo}` : ''}

Create ${taskType} content that is:
- Professional and persuasive
- Tailored to the client's needs
- Clear and well-structured
- Action-oriented

For proposals: Include project scope, timeline, deliverables, and value proposition
For onboarding: Include processes, expectations, and documentation
For presentations: Include key talking points and visual structure
For prospect research: Include market insights and targeting strategy

Provide:
1. Main content/document
2. Recommended next steps
3. Supporting materials needed
    `.trim();
    
    const result = await agent!.generate(prompt);
    
    return {
      content: result.text,
      nextSteps: [],
      materials: [],
    };
  },
});

