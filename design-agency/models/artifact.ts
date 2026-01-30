import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Custom Zod validator for MongoDB ObjectId
const objectIdSchema = z.custom<ObjectId>(
  (val) => val instanceof ObjectId || ObjectId.isValid(val as string),
  { message: 'Invalid ObjectId' }
);

// ============================================
// ARTIFACT SCHEMAS
// ============================================

export const ArtifactTypeSchema = z.enum([
  'design',
  'code',
  'documentation',
  'research',
  'wireframe',
  'component',
  'api',
  'test',
  'report',
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

export const ArtifactMetadataSchema = z.object({
  language: z.string().optional(),
  framework: z.string().optional(),
  componentType: z.string().optional(),
  designTool: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).catchall(z.any()); // Allow additional properties

export const ArtifactSchema = z.object({
  _id: objectIdSchema,
  projectId: objectIdSchema,
  taskId: objectIdSchema.optional(),
  type: ArtifactTypeSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  content: z.string(), // Code, design spec, JSON, etc.
  fileUrl: z.string().url().optional(), // For external file storage
  metadata: ArtifactMetadataSchema,
  createdBy: AgentTypeSchema,
  version: z.number().int().positive().default(1),
  previousVersionId: objectIdSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// For creating new artifacts
export const CreateArtifactSchema = ArtifactSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// For updating artifacts
export const UpdateArtifactSchema = ArtifactSchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type ArtifactInput = z.infer<typeof CreateArtifactSchema>;
export type ArtifactUpdate = z.infer<typeof UpdateArtifactSchema>;

