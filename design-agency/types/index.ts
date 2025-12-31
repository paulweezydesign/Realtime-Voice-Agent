import { ObjectId } from 'mongodb';

// ============================================
// ENUMS & CONSTANTS
// ============================================

export enum ProjectStatus {
  INTAKE = 'intake',
  RESEARCH = 'research',
  DESIGN = 'design',
  DEVELOPMENT = 'development',
  QA = 'qa',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AgentType {
  PROJECT_MANAGER = 'project_manager',
  DEEP_RESEARCH = 'deep_research',
  DESIGN = 'design',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  QA = 'qa',
  CLIENT_ACQUISITION = 'client_acquisition',
}

export enum ArtifactType {
  DESIGN = 'design',
  CODE = 'code',
  DOCUMENTATION = 'documentation',
  RESEARCH = 'research',
  WIREFRAME = 'wireframe',
  COMPONENT = 'component',
  API = 'api',
  TEST = 'test',
  REPORT = 'report',
}

export enum EventType {
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_STATUS_CHANGED = 'project_status_changed',
  TASK_CREATED = 'task_created',
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  AGENT_STARTED = 'agent_started',
  AGENT_COMPLETED = 'agent_completed',
  AGENT_ERROR = 'agent_error',
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  ARTIFACT_CREATED = 'artifact_created',
  CLIENT_CREATED = 'client_created',
  MESSAGE_SENT = 'message_sent',
}

export enum ClientStatus {
  LEAD = 'lead',
  QUALIFIED = 'qualified',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

// ============================================
// PROJECT TYPES
// ============================================

export interface ProjectPhase {
  name: string;
  status: ProjectStatus;
  startedAt?: Date;
  completedAt?: Date;
  assignedAgents: AgentType[];
}

export interface ProjectTimeline {
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  milestones: ProjectMilestone[];
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completedAt?: Date;
  status: 'pending' | 'completed' | 'overdue';
}

export interface ProjectRequirements {
  description: string;
  features: string[];
  technicalStack: string[];
  designPreferences?: string[];
  targetAudience?: string;
  constraints?: string[];
}

export interface Project {
  _id: ObjectId;
  name: string;
  description: string;
  clientId: ObjectId;
  status: ProjectStatus;
  currentPhase: ProjectStatus;
  phases: ProjectPhase[];
  requirements: ProjectRequirements;
  timeline: ProjectTimeline;
  budget?: number;
  assignedAgents: AgentType[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TASK TYPES
// ============================================

export interface TaskDependency {
  taskId: ObjectId;
  type: 'blocks' | 'blocked_by' | 'related';
}

export interface TaskResult {
  success: boolean;
  output?: any;
  error?: string;
  artifacts?: ObjectId[];
}

export interface Task {
  _id: ObjectId;
  projectId: ObjectId;
  name: string;
  description: string;
  assignedAgent: AgentType;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: TaskDependency[];
  input: Record<string, any>;
  result?: TaskResult;
  artifacts: ObjectId[];
  retryCount: number;
  maxRetries: number;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// ============================================
// CLIENT TYPES
// ============================================

export interface ClientContactInfo {
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  address?: string;
}

export interface ClientPreferences {
  communicationChannels: string[];
  designStyle?: string[];
  technicalPreferences?: string[];
  budget?: { min: number; max: number };
  timeline?: string;
}

export interface Client {
  _id: ObjectId;
  name: string;
  contactInfo: ClientContactInfo;
  status: ClientStatus;
  industry?: string;
  preferences: ClientPreferences;
  projects: ObjectId[];
  leadSource?: string;
  qualificationScore?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CONVERSATION TYPES
// ============================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Conversation {
  _id: ObjectId;
  projectId?: ObjectId;
  clientId?: ObjectId;
  agentId: string;
  agentType: AgentType;
  thread: string;
  resource: string;
  messages: ConversationMessage[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ARTIFACT TYPES
// ============================================

export interface ArtifactMetadata {
  language?: string;
  framework?: string;
  componentType?: string;
  designTool?: string;
  version?: string;
  tags?: string[];
  [key: string]: any;
}

export interface Artifact {
  _id: ObjectId;
  projectId: ObjectId;
  taskId?: ObjectId;
  type: ArtifactType;
  name: string;
  description?: string;
  content: string; // Could be code, design spec, JSON, etc.
  fileUrl?: string; // For external file storage
  metadata: ArtifactMetadata;
  createdBy: AgentType;
  version: number;
  previousVersionId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// EVENT TYPES (Event Sourcing)
// ============================================

export interface EventPayload {
  [key: string]: any;
}

export interface Event {
  _id: ObjectId;
  type: EventType;
  projectId?: ObjectId;
  taskId?: ObjectId;
  agentType?: AgentType;
  payload: EventPayload;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============================================
// AGENT EXECUTION TYPES
// ============================================

export interface AgentExecutionLog {
  _id: ObjectId;
  projectId: ObjectId;
  taskId?: ObjectId;
  agentType: AgentType;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration: number; // in milliseconds
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  createdAt: Date;
}

// ============================================
// WORKFLOW TYPES
// ============================================

export interface WorkflowExecution {
  _id: ObjectId;
  workflowId: string;
  workflowName: string;
  projectId: ObjectId;
  runId: string;
  status: 'running' | 'suspended' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  currentStep?: string;
  steps: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

