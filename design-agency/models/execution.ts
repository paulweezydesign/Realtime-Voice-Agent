import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Custom Zod validator for MongoDB ObjectId
const objectIdSchema = z.custom<ObjectId>(
  (val) => val instanceof ObjectId || ObjectId.isValid(val as string),
  { message: 'Invalid ObjectId' }
);

// ============================================
// EXECUTION SCHEMAS
// ============================================

export const AgentTypeSchema = z.enum([
  'project_manager',
  'deep_research',
  'design',
  'frontend',
  'backend',
  'qa',
  'client_acquisition',
]);

// Agent Execution Log Schema
export const AgentExecutionLogSchema = z.object({
  _id: objectIdSchema,
  projectId: objectIdSchema,
  taskId: objectIdSchema.optional(),
  agentType: AgentTypeSchema,
  input: z.record(z.any()),
  output: z.record(z.any()).optional(),
  error: z.string().optional(),
  duration: z.number().positive(), // milliseconds
  tokenUsage: z
    .object({
      prompt: z.number().int().nonnegative(),
      completion: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    })
    .optional(),
  createdAt: z.date(),
});

// Workflow Execution Schema
export const WorkflowExecutionSchema = z.object({
  _id: objectIdSchema,
  workflowId: z.string(),
  workflowName: z.string(),
  projectId: objectIdSchema,
  runId: z.string(),
  status: z.enum(['running', 'suspended', 'completed', 'failed']),
  input: z.record(z.any()),
  output: z.record(z.any()).optional(),
  currentStep: z.string().optional(),
  steps: z.record(z.any()),
  error: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
});

// For creating new execution logs
export const CreateAgentExecutionLogSchema = AgentExecutionLogSchema.omit({
  _id: true,
  createdAt: true,
});

export const CreateWorkflowExecutionSchema = WorkflowExecutionSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// For updating workflow executions
export const UpdateWorkflowExecutionSchema = WorkflowExecutionSchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type AgentExecutionLogInput = z.infer<typeof CreateAgentExecutionLogSchema>;
export type WorkflowExecutionInput = z.infer<typeof CreateWorkflowExecutionSchema>;
export type WorkflowExecutionUpdate = z.infer<typeof UpdateWorkflowExecutionSchema>;

