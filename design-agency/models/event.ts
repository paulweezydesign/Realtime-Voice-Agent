import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Custom Zod validator for MongoDB ObjectId
const objectIdSchema = z.custom<ObjectId>(
  (val) => val instanceof ObjectId || ObjectId.isValid(val as string),
  { message: 'Invalid ObjectId' }
);

// ============================================
// EVENT SCHEMAS (Event Sourcing)
// ============================================

export const EventTypeSchema = z.enum([
  'project_created',
  'project_updated',
  'project_status_changed',
  'task_created',
  'task_assigned',
  'task_completed',
  'task_failed',
  'agent_started',
  'agent_completed',
  'agent_error',
  'workflow_started',
  'workflow_completed',
  'workflow_failed',
  'artifact_created',
  'client_created',
  'message_sent',
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

export const EventSchema = z.object({
  _id: objectIdSchema,
  type: EventTypeSchema,
  projectId: objectIdSchema.optional(),
  taskId: objectIdSchema.optional(),
  agentType: AgentTypeSchema.optional(),
  payload: z.record(z.any()),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

// For creating new events
export const CreateEventSchema = EventSchema.omit({
  _id: true,
  timestamp: true,
});

export type EventInput = z.infer<typeof CreateEventSchema>;

