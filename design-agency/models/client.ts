import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Custom Zod validator for MongoDB ObjectId
const objectIdSchema = z.custom<ObjectId>(
  (val) => val instanceof ObjectId || ObjectId.isValid(val as string),
  { message: 'Invalid ObjectId' }
);

// ============================================
// CLIENT SCHEMAS
// ============================================

export const ClientStatusSchema = z.enum([
  'lead',
  'qualified',
  'active',
  'inactive',
  'archived',
]);

export const ClientContactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
});

export const ClientPreferencesSchema = z.object({
  communicationChannels: z.array(z.string()).default(['email']),
  designStyle: z.array(z.string()).optional(),
  technicalPreferences: z.array(z.string()).optional(),
  budget: z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
    })
    .optional(),
  timeline: z.string().optional(),
});

export const ClientSchema = z.object({
  _id: objectIdSchema,
  name: z.string().min(1).max(200),
  contactInfo: ClientContactInfoSchema,
  status: ClientStatusSchema,
  industry: z.string().optional(),
  preferences: ClientPreferencesSchema,
  projects: z.array(objectIdSchema).default([]),
  leadSource: z.string().optional(),
  qualificationScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// For creating new clients
export const CreateClientSchema = ClientSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// For updating clients
export const UpdateClientSchema = ClientSchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type ClientInput = z.infer<typeof CreateClientSchema>;
export type ClientUpdate = z.infer<typeof UpdateClientSchema>;

