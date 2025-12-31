import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Custom Zod validator for MongoDB ObjectId
const objectIdSchema = z.custom<ObjectId>(
  (val) => val instanceof ObjectId || ObjectId.isValid(val as string),
  { message: 'Invalid ObjectId' }
);

// ============================================
// PROJECT SCHEMAS
// ============================================

export const ProjectStatusSchema = z.enum([
  'intake',
  'research',
  'design',
  'development',
  'qa',
  'review',
  'completed',
  'cancelled',
  'on_hold',
]);

export const AgentTypeSchema = z.enum([
  'project_manager',
  'deep_research',
  'design',
  'frontend',
  'backend',
  'qa',
  'client_acquisition',
]);

export const ProjectPhaseSchema = z.object({
  name: z.string(),
  status: ProjectStatusSchema,
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  assignedAgents: z.array(AgentTypeSchema),
});

export const ProjectMilestoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  dueDate: z.date(),
  completedAt: z.date().optional(),
  status: z.enum(['pending', 'completed', 'overdue']),
});

export const ProjectTimelineSchema = z.object({
  estimatedStartDate: z.date(),
  estimatedEndDate: z.date(),
  actualStartDate: z.date().optional(),
  actualEndDate: z.date().optional(),
  milestones: z.array(ProjectMilestoneSchema),
});

export const ProjectRequirementsSchema = z.object({
  description: z.string(),
  features: z.array(z.string()),
  technicalStack: z.array(z.string()),
  designPreferences: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  constraints: z.array(z.string()).optional(),
});

export const ProjectSchema = z.object({
  _id: objectIdSchema,
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  clientId: objectIdSchema,
  status: ProjectStatusSchema,
  currentPhase: ProjectStatusSchema,
  phases: z.array(ProjectPhaseSchema),
  requirements: ProjectRequirementsSchema,
  timeline: ProjectTimelineSchema,
  budget: z.number().positive().optional(),
  assignedAgents: z.array(AgentTypeSchema),
  metadata: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// For creating new projects (without _id and timestamps)
export const CreateProjectSchema = ProjectSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// For updating projects
export const UpdateProjectSchema = ProjectSchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type ProjectInput = z.infer<typeof CreateProjectSchema>;
export type ProjectUpdate = z.infer<typeof UpdateProjectSchema>;

