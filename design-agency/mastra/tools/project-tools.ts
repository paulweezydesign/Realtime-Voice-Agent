import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase } from '../../lib/mongodb';
import { CreateProjectSchema, UpdateProjectSchema } from '../../models/project';
import { ObjectId } from 'mongodb';
import { ProjectStatus, AgentType } from '../../types';

/**
 * Tool for creating new projects
 */
export const createProjectTool = createTool({
  id: 'create-project',
  description: `Creates a new project in the system. Use this when a client has been qualified 
    and is ready to start a project. This initializes the project lifecycle with initial phases, 
    requirements, timeline, and assigns the project manager agent.`,
  inputSchema: z.object({
    name: z.string().describe('Project name'),
    description: z.string().describe('Project description'),
    clientId: z.string().describe('Client ID (MongoDB ObjectId string)'),
    requirements: z.object({
      description: z.string(),
      features: z.array(z.string()),
      technicalStack: z.array(z.string()),
      designPreferences: z.array(z.string()).optional(),
      targetAudience: z.string().optional(),
      constraints: z.array(z.string()).optional(),
    }),
    estimatedStartDate: z.string().describe('ISO 8601 date string'),
    estimatedEndDate: z.string().describe('ISO 8601 date string'),
    budget: z.number().optional(),
  }),
  outputSchema: z.object({
    projectId: z.string(),
    status: z.string(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    
    const projectData = CreateProjectSchema.parse({
      name: context.name,
      description: context.description,
      clientId: new ObjectId(context.clientId),
      status: ProjectStatus.INTAKE,
      currentPhase: ProjectStatus.INTAKE,
      phases: [
        {
          name: 'Intake',
          status: ProjectStatus.INTAKE,
          assignedAgents: [AgentType.PROJECT_MANAGER],
        },
      ],
      requirements: context.requirements,
      timeline: {
        estimatedStartDate: new Date(context.estimatedStartDate),
        estimatedEndDate: new Date(context.estimatedEndDate),
        milestones: [],
      },
      budget: context.budget,
      assignedAgents: [AgentType.PROJECT_MANAGER],
      metadata: {},
    });

    const result = await db.collection('projects').insertOne({
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      projectId: result.insertedId.toString(),
      status: 'success',
      message: `Project "${context.name}" created successfully`,
    };
  },
});

/**
 * Tool for updating project status
 */
export const updateProjectStatusTool = createTool({
  id: 'update-project-status',
  description: `Updates the status and current phase of a project. Use this when transitioning 
    a project between lifecycle phases (e.g., from intake to research, research to design, etc.). 
    This is critical for tracking project progress.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    newStatus: z.enum([
      'intake',
      'research',
      'design',
      'development',
      'qa',
      'review',
      'completed',
      'cancelled',
      'on_hold',
    ]),
    notes: z.string().optional().describe('Optional notes about the status change'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    previousStatus: z.string(),
    newStatus: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const project = await db.collection('projects').findOne({ _id: projectId });
    if (!project) {
      return {
        success: false,
        message: 'Project not found',
        previousStatus: '',
        newStatus: context.newStatus,
      };
    }

    const updateData = UpdateProjectSchema.parse({
      status: context.newStatus,
      currentPhase: context.newStatus,
      updatedAt: new Date(),
    });

    await db.collection('projects').updateOne(
      { _id: projectId },
      { $set: updateData }
    );

    // Log event
    await db.collection('events').insertOne({
      type: 'project_status_changed',
      projectId: projectId,
      payload: {
        previousStatus: project.status,
        newStatus: context.newStatus,
        notes: context.notes,
      },
      timestamp: new Date(),
    });

    return {
      success: true,
      message: `Project status updated from ${project.status} to ${context.newStatus}`,
      previousStatus: project.status,
      newStatus: context.newStatus,
    };
  },
});

/**
 * Tool for getting project details
 */
export const getProjectTool = createTool({
  id: 'get-project',
  description: `Retrieves detailed information about a specific project including its status, 
    phases, requirements, timeline, assigned agents, and related tasks. Use this to get current 
    project state before making decisions or updates.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
  }),
  outputSchema: z.object({
    project: z.any(),
    taskCount: z.number(),
    artifactCount: z.number(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const project = await db.collection('projects').findOne({ _id: projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    const taskCount = await db.collection('tasks').countDocuments({ projectId });
    const artifactCount = await db.collection('artifacts').countDocuments({ projectId });

    return {
      project,
      taskCount,
      artifactCount,
    };
  },
});

/**
 * Tool for listing all projects
 */
export const listProjectsTool = createTool({
  id: 'list-projects',
  description: `Lists all projects in the system with optional filtering by status or client. 
    Use this to get an overview of active projects, projects needing attention, or to see 
    a client's project history.`,
  inputSchema: z.object({
    status: z.enum([
      'intake',
      'research',
      'design',
      'development',
      'qa',
      'review',
      'completed',
      'cancelled',
      'on_hold',
    ]).optional(),
    clientId: z.string().optional().describe('Filter by client ID'),
    limit: z.number().default(20).describe('Maximum number of projects to return'),
  }),
  outputSchema: z.object({
    projects: z.array(z.any()),
    total: z.number(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    
    const filter: any = {};
    if (context.status) {
      filter.status = context.status;
    }
    if (context.clientId) {
      filter.clientId = new ObjectId(context.clientId);
    }

    const projects = await db
      .collection('projects')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(context.limit)
      .toArray();

    const total = await db.collection('projects').countDocuments(filter);

    return {
      projects,
      total,
    };
  },
});

/**
 * Tool for assigning agents to a project
 */
export const assignAgentToProjectTool = createTool({
  id: 'assign-agent-to-project',
  description: `Assigns a specialized agent to a project. Use this when a project needs a 
    specific agent's expertise (e.g., design agent for design phase, frontend agent for 
    development phase). This updates the project's assigned agents list.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    agentType: z.enum([
      'project_manager',
      'deep_research',
      'design',
      'frontend',
      'backend',
      'qa',
      'client_acquisition',
    ]),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    await db.collection('projects').updateOne(
      { _id: projectId },
      {
        $addToSet: { assignedAgents: context.agentType },
        $set: { updatedAt: new Date() },
      }
    );

    // Log event
    await db.collection('events').insertOne({
      type: 'task_assigned',
      projectId: projectId,
      agentType: context.agentType,
      payload: { agentType: context.agentType },
      timestamp: new Date(),
    });

    return {
      success: true,
      message: `${context.agentType} assigned to project`,
    };
  },
});

