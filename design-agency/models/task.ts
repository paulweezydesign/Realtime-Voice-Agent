import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Custom Zod validator for MongoDB ObjectId
const objectIdSchema = z.custom<ObjectId>(
  (val) => val instanceof ObjectId || ObjectId.isValid(val as string),
  { message: 'Invalid ObjectId' }
);

// ============================================
// TASK SCHEMAS
// ============================================

export const TaskStatusSchema = z.enum([
  'pending',
  'in_progress',
  'blocked',
  'completed',
  'failed',
  'cancelled',
]);

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const AgentTypeSchema = z.enum([
  'project_manager',
  'deep_research',
  'design',
  'frontend',
  'backend',
  'qa',
  'client_acquisition',
]);

export const TaskDependencySchema = z.object({
  taskId: objectIdSchema,
  type: z.enum(['blocks', 'blocked_by', 'related']),
});

export const TaskResultSchema = z.object({
  success: z.boolean(),
  output: z.any().optional(),
  error: z.string().optional(),
  artifacts: z.array(objectIdSchema).optional(),
});

export const TaskSchema = z.object({
  _id: objectIdSchema,
  projectId: objectIdSchema,
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  assignedAgent: AgentTypeSchema,
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dependencies: z.array(TaskDependencySchema).default([]),
  input: z.record(z.any()),
  result: TaskResultSchema.optional(),
  artifacts: z.array(objectIdSchema).default([]),
  retryCount: z.number().int().min(0).default(0),
  maxRetries: z.number().int().min(0).default(3),
  estimatedDuration: z.number().positive().optional(),
  actualDuration: z.number().positive().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

// For creating new tasks
export const CreateTaskSchema = TaskSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  startedAt: true,
  completedAt: true,
});

// For updating tasks
export const UpdateTaskSchema = TaskSchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type TaskInput = z.infer<typeof CreateTaskSchema>;
export type TaskUpdate = z.infer<typeof UpdateTaskSchema>;

