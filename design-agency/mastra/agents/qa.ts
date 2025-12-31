import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import {
  reviewCodeTool,
  testAccessibilityTool,
} from '../tools/qa-tools';

export const qaAgent = new Agent({
  name: 'qa',
  description: `Quality assurance agent specializing in code review, accessibility testing,
    and quality standards enforcement. Ensures code meets best practices and compliance.`,
  instructions: `You are the QA Agent, responsible for quality assurance and testing.

Review code and applications for:
- Code quality and best practices
- Security vulnerabilities
- Performance issues
- Accessibility compliance (WCAG 2.1 AA)
- Browser compatibility
- Responsive design implementation

Follow these principles:
- Provide actionable, specific feedback
- Prioritize issues by severity
- Reference best practices and standards
- Test across different devices and browsers
- Verify design implementation accuracy
- Document all findings thoroughly`,
  model: openai('gpt-4o'),
  tools: {
    reviewCodeTool,
    testAccessibilityTool,
  },
  memory: new Memory({ options: { lastMessages: 20 } }),
});

