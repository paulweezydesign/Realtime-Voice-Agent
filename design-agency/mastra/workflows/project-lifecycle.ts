import { Workflow, Step } from '@mastra/core';
import { z } from 'zod';

/**
 * Project Lifecycle Workflow
 * 
 * Orchestrates the complete project lifecycle from intake through completion.
 * Coordinates multiple agents to execute project phases sequentially.
 */
export const projectLifecycleWorkflow = new Workflow({
  name: 'project-lifecycle',
  triggerSchema: z.object({
    projectId: z.string(),
    clientId: z.string(),
    projectName: z.string(),
    requirements: z.string(),
  }),
});

// Step 1: Initialize Project
projectLifecycleWorkflow.step('initialize-project', {
  execute: async ({ context, mastra }) => {
    const agent = mastra.getAgent('project-manager');
    
    const result = await agent.generate(
      `Create a new project with the following details:
      - Name: ${context.triggerData.projectName}
      - Client ID: ${context.triggerData.clientId}
      - Requirements: ${context.triggerData.requirements}
      
      Use the createProjectTool to initialize the project.`
    );

    return {
      projectId: context.triggerData.projectId,
      status: 'initialized',
    };
  },
});

// Step 2: Research Phase
projectLifecycleWorkflow.step('research-phase', {
  execute: async ({ context, mastra }) => {
    const projectManager = mastra.getAgent('project-manager');
    const deepResearch = mastra.getAgent('deep-research');

    // Assign research agent
    await projectManager.generate(
      `Assign the deep-research agent to project ${context.projectId}`
    );

    // Conduct research
    await deepResearch.generate(
      `Conduct comprehensive research for project ${context.projectId}:
      1. Analyze competitors in the space
      2. Gather detailed technical requirements
      3. Conduct market research
      4. Create research summary
      
      Use all available research tools.`
    );

    // Update project status
    await projectManager.generate(
      `Update project ${context.projectId} status to 'research' phase.`
    );

    return {
      phase: 'research',
      completed: true,
    };
  },
});

// Step 3: Design Phase
projectLifecycleWorkflow.step('design-phase', {
  execute: async ({ context, mastra }) => {
    const projectManager = mastra.getAgent('project-manager');
    const design = mastra.getAgent('design');

    // Assign design agent
    await projectManager.generate(
      `Assign the design agent to project ${context.projectId}`
    );

    // Create designs
    await design.generate(
      `Create comprehensive designs for project ${context.projectId}:
      1. Create wireframes for key pages and user flows
      2. Develop design system with brand colors and tokens
      3. Create high-fidelity mockups (desktop, tablet, mobile)
      4. Document component specifications
      
      Use all available design tools.`
    );

    // Update project status
    await projectManager.generate(
      `Update project ${context.projectId} status to 'design' phase.`
    );

    return {
      phase: 'design',
      completed: true,
    };
  },
});

// Step 4: Development Phase
projectLifecycleWorkflow.step('development-phase', {
  execute: async ({ context, mastra }) => {
    const projectManager = mastra.getAgent('project-manager');
    const frontend = mastra.getAgent('frontend');
    const backend = mastra.getAgent('backend');

    // Assign development agents
    await projectManager.generate(
      `Assign both frontend and backend agents to project ${context.projectId}`
    );

    // Frontend development
    await frontend.generate(
      `Implement frontend for project ${context.projectId}:
      1. Generate UI components based on design specs
      2. Implement pages with proper routing
      3. Ensure responsive design and accessibility
      
      Use available frontend tools.`
    );

    // Backend development
    await backend.generate(
      `Implement backend for project ${context.projectId}:
      1. Create API routes for required endpoints
      2. Define database schemas
      3. Implement business logic
      
      Use available backend tools.`
    );

    // Update project status
    await projectManager.generate(
      `Update project ${context.projectId} status to 'development' phase.`
    );

    return {
      phase: 'development',
      completed: true,
    };
  },
});

// Step 5: QA Phase
projectLifecycleWorkflow.step('qa-phase', {
  execute: async ({ context, mastra }) => {
    const projectManager = mastra.getAgent('project-manager');
    const qa = mastra.getAgent('qa');

    // Assign QA agent
    await projectManager.generate(
      `Assign the qa agent to project ${context.projectId}`
    );

    // Conduct QA
    await qa.generate(
      `Perform quality assurance for project ${context.projectId}:
      1. Review code for best practices and security
      2. Test accessibility compliance (WCAG 2.1 AA)
      3. Document all findings and issues
      
      Use available QA tools.`
    );

    // Update project status
    await projectManager.generate(
      `Update project ${context.projectId} status to 'qa' phase.`
    );

    return {
      phase: 'qa',
      completed: true,
    };
  },
});

// Step 6: Review and Completion
projectLifecycleWorkflow.step('review-completion', {
  execute: async ({ context, mastra }) => {
    const projectManager = mastra.getAgent('project-manager');

    // Update to review phase
    await projectManager.generate(
      `Update project ${context.projectId} status to 'review' phase.`
    );

    // Mark as completed after review
    await projectManager.generate(
      `After stakeholder approval, update project ${context.projectId} status to 'completed'.`
    );

    return {
      phase: 'completed',
      success: true,
    };
  },
});

// Commit the workflow
projectLifecycleWorkflow.commit();

