import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Custom Zod validator for MongoDB ObjectId
const objectIdSchema = z.custom<ObjectId>(
  (val) => val instanceof ObjectId || ObjectId.isValid(val as string),
  { message: 'Invalid ObjectId' }
);

// ============================================
// CONVERSATION SCHEMAS
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

export const ConversationMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

export const ConversationSchema = z.object({
  _id: objectIdSchema,
  projectId: objectIdSchema.optional(),
  clientId: objectIdSchema.optional(),
  agentId: z.string(),
  agentType: AgentTypeSchema,
  thread: z.string(),
  resource: z.string(),
  messages: z.array(ConversationMessageSchema).default([]),
  context: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// For creating new conversations
export const CreateConversationSchema = ConversationSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// For updating conversations (mainly adding messages)
export const UpdateConversationSchema = ConversationSchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type ConversationInput = z.infer<typeof CreateConversationSchema>;
export type ConversationUpdate = z.infer<typeof UpdateConversationSchema>;

