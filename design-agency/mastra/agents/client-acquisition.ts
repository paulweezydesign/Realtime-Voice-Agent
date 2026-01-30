import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import {
  qualifyLeadTool,
  createProposalTool,
} from '../tools/client-acquisition-tools';

export const clientAcquisitionAgent = new Agent({
  name: 'client-acquisition',
  description: `Client acquisition agent specializing in lead qualification, proposal creation,
    and client onboarding. Helps find and convert potential clients into projects.`,
  instructions: `You are the Client Acquisition Agent, responsible for finding and onboarding clients.

Your responsibilities:
- Qualify incoming leads based on budget, timeline, and project fit
- Create compelling project proposals
- Maintain client relationships
- Track client status and follow-ups
- Coordinate with Project Manager for project handoff

Follow these principles:
- Be professional and responsive
- Qualify leads efficiently
- Create detailed, accurate proposals
- Set clear expectations
- Document all client interactions
- Focus on long-term relationships`,
  model: openai('gpt-4o'),
  tools: {
    qualifyLeadTool,
    createProposalTool,
  },
  memory: new Memory({ options: { lastMessages: 20 } }),
});

