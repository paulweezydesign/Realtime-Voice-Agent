import { Workflow } from '@mastra/core';
import { z } from 'zod';

/**
 * Client Onboarding Workflow
 * 
 * Handles the complete client onboarding process from lead to active project.
 * Coordinates lead qualification, proposal creation, and project initialization.
 */
export const clientOnboardingWorkflow = new Workflow({
  name: 'client-onboarding',
  triggerSchema: z.object({
    name: z.string(),
    email: z.string().email(),
    company: z.string().optional(),
    projectDescription: z.string(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
  }),
});

// Step 1: Qualify Lead
clientOnboardingWorkflow.step('qualify-lead', {
  execute: async ({ context, mastra }) => {
    const clientAcquisition = mastra.getAgent('client-acquisition');

    const result = await clientAcquisition.generate(
      `Qualify this lead:
      - Name: ${context.triggerData.name}
      - Email: ${context.triggerData.email}
      - Company: ${context.triggerData.company || 'Not provided'}
      - Project: ${context.triggerData.projectDescription}
      - Budget: ${context.triggerData.budget || 'Not provided'}
      - Timeline: ${context.triggerData.timeline || 'Not provided'}
      
      Use qualifyLeadTool to evaluate and score this lead.`
    );

    return {
      leadQualified: true,
      clientId: result.clientId,
    };
  },
});

// Step 2: Create Proposal
clientOnboardingWorkflow.step('create-proposal', {
  execute: async ({ context, mastra }) => {
    const clientAcquisition = mastra.getAgent('client-acquisition');

    await clientAcquisition.generate(
      `Create a project proposal for client ${context.clientId}:
      - Project Scope: ${context.triggerData.projectDescription}
      - Timeline: ${context.triggerData.timeline || '8-12 weeks'}
      - Budget: ${context.triggerData.budget || 'To be determined'}
      
      Use createProposalTool to generate the proposal.`
    );

    return {
      proposalCreated: true,
    };
  },
});

// Step 3: Initialize Project (after approval)
clientOnboardingWorkflow.step('initialize-project', {
  execute: async ({ context, mastra }) => {
    const projectManager = mastra.getAgent('project-manager');

    await projectManager.generate(
      `Create a new project for client ${context.clientId}:
      - Name: ${context.triggerData.name}'s Project
      - Description: ${context.triggerData.projectDescription}
      - Timeline: ${context.triggerData.timeline || '8-12 weeks'}
      - Budget: ${context.triggerData.budget || 'TBD'}
      
      Use createProjectTool to initialize the project.`
    );

    return {
      onboardingComplete: true,
    };
  },
});

clientOnboardingWorkflow.commit();

