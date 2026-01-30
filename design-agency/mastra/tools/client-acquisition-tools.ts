import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { ClientStatus, AgentType } from '../../types';

/**
 * Tool for qualifying leads
 */
export const qualifyLeadTool = createTool({
  id: 'qualify-lead',
  description: `Evaluates and qualifies potential clients based on budget, timeline, project fit,
    and decision-making authority. Creates client record with qualification score.`,
  inputSchema: z.object({
    name: z.string(),
    email: z.string().email(),
    company: z.string().optional(),
    projectDescription: z.string(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
  }),
  outputSchema: z.object({
    clientId: z.string(),
    qualificationScore: z.number(),
    recommendation: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();

    // Simple qualification scoring
    let score = 50; // Base score
    if (context.budget) score += 20;
    if (context.timeline) score += 15;
    if (context.company) score += 15;

    const client = await db.collection('clients').insertOne({
      name: context.name,
      email: context.email,
      company: context.company || '',
      contactInfo: { email: context.email },
      projects: [],
      status: score >= 70 ? ClientStatus.ACTIVE : ClientStatus.LEAD,
      notes: [
        {
          content: `Initial lead qualification. Score: ${score}/100`,
          createdAt: new Date(),
          createdBy: AgentType.CLIENT_ACQUISITION,
        },
      ],
      metadata: {
        qualificationScore: score,
        projectDescription: context.projectDescription,
        estimatedBudget: context.budget,
        estimatedTimeline: context.timeline,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const recommendation = score >= 80
      ? 'High-quality lead. Schedule discovery call immediately.'
      : score >= 60
      ? 'Qualified lead. Follow up within 24 hours.'
      : 'Needs more information. Send qualification questionnaire.';

    return {
      clientId: client.insertedId.toString(),
      qualificationScore: score,
      recommendation,
    };
  },
});

/**
 * Tool for creating client proposals
 */
export const createProposalTool = createTool({
  id: 'create-proposal',
  description: `Generates project proposals with scope, timeline, pricing, and deliverables.
    Creates professional proposal documents based on client requirements and research.`,
  inputSchema: z.object({
    clientId: z.string(),
    projectScope: z.string(),
    timeline: z.string(),
    budget: z.string(),
    deliverables: z.array(z.string()),
  }),
  outputSchema: z.object({
    proposalId: z.string(),
    proposalUrl: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const clientId = new ObjectId(context.clientId);

    const proposal = {
      clientId,
      projectScope: context.projectScope,
      timeline: context.timeline,
      budget: context.budget,
      deliverables: context.deliverables,
      sections: {
        executiveSummary: 'Project overview and objectives',
        scope: context.projectScope,
        timeline: context.timeline,
        deliverables: context.deliverables,
        pricing: context.budget,
        terms: 'Standard agency terms and conditions',
      },
      status: 'draft',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    const result = await db.collection('proposals').insertOne(proposal);

    // Add note to client
    await db.collection('clients').updateOne(
      { _id: clientId },
      {
        $push: {
          notes: {
            content: `Proposal created: ${context.projectScope}`,
            createdAt: new Date(),
            createdBy: AgentType.CLIENT_ACQUISITION,
          },
        },
        $set: { updatedAt: new Date() },
      }
    );

    return {
      proposalId: result.insertedId.toString(),
      proposalUrl: `/proposals/${result.insertedId.toString()}`,
    };
  },
});

