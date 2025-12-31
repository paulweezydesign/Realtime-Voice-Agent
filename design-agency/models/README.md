# Data Models & Schemas

Comprehensive data models for the Design Development Agency platform with MongoDB and Zod validation.

## 📚 Collections Overview

The platform uses 8 main MongoDB collections:

1. **projects** - Client projects and their lifecycle
2. **tasks** - Individual tasks assigned to agents
3. **clients** - Client information and lead tracking
4. **conversations** - Agent conversation history and memory
5. **artifacts** - Generated artifacts (designs, code, documentation)
6. **events** - Event sourcing log for full system traceability
7. **agent_execution_logs** - Agent performance and execution tracking
8. **workflow_executions** - Workflow execution state and history

## 🏗️ Data Models

### Project

Represents a client project with all phases, requirements, and timeline.

```typescript
{
  _id: ObjectId,
  name: string,                    // Project name
  description: string,             // Project description
  clientId: ObjectId,              // Reference to client
  status: ProjectStatus,           // Current status
  currentPhase: ProjectStatus,     // Current phase
  phases: ProjectPhase[],          // All project phases
  requirements: {
    description: string,
    features: string[],
    technicalStack: string[],
    designPreferences?: string[],
    targetAudience?: string,
    constraints?: string[]
  },
  timeline: {
    estimatedStartDate: Date,
    estimatedEndDate: Date,
    actualStartDate?: Date,
    actualEndDate?: Date,
    milestones: ProjectMilestone[]
  },
  budget?: number,
  assignedAgents: AgentType[],
  metadata: Record<string, any>,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `clientId` - Query projects by client
- `status` - Filter by project status
- `currentPhase` - Filter by current phase
- `createdAt` - Sort by creation date
- `timeline.estimatedEndDate` - Sort by deadline
- Compound: `clientId + status` - Active projects per client

### Task

Individual tasks assigned to agents with dependencies and results.

```typescript
{
  _id: ObjectId,
  projectId: ObjectId,             // Reference to project
  name: string,
  description: string,
  assignedAgent: AgentType,        // Agent responsible
  status: TaskStatus,
  priority: TaskPriority,
  dependencies: TaskDependency[],  // Task dependencies
  input: Record<string, any>,      // Task input data
  result?: {
    success: boolean,
    output?: any,
    error?: string,
    artifacts?: ObjectId[]
  },
  artifacts: ObjectId[],           // Generated artifacts
  retryCount: number,
  maxRetries: number,
  estimatedDuration?: number,      // minutes
  actualDuration?: number,         // minutes
  createdAt: Date,
  updatedAt: Date,
  startedAt?: Date,
  completedAt?: Date
}
```

**Indexes:**
- `projectId` - Tasks by project
- `assignedAgent` - Tasks by agent
- `status` - Filter by status
- `priority` - Sort by priority
- Compound: `projectId + status` - Project task board
- Compound: `assignedAgent + status + priority` - Agent task queue

### Client

Client information with lead tracking and preferences.

```typescript
{
  _id: ObjectId,
  name: string,
  contactInfo: {
    email: string,                 // Unique
    phone?: string,
    company?: string,
    website?: string,
    address?: string
  },
  status: ClientStatus,
  industry?: string,
  preferences: {
    communicationChannels: string[],
    designStyle?: string[],
    technicalPreferences?: string[],
    budget?: { min: number, max: number },
    timeline?: string
  },
  projects: ObjectId[],            // Related projects
  leadSource?: string,             // Where lead came from
  qualificationScore?: number,     // 0-100
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `contactInfo.email` - Unique index
- `status` - Filter by status
- `leadSource` - Group by source
- `qualificationScore` - Sort by score

### Conversation

Agent conversation history for memory persistence.

```typescript
{
  _id: ObjectId,
  projectId?: ObjectId,
  clientId?: ObjectId,
  agentId: string,                 // Mastra agent ID
  agentType: AgentType,
  thread: string,                  // Mastra thread ID
  resource: string,                // Mastra resource ID
  messages: {
    id: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    timestamp: Date,
    metadata?: Record<string, any>
  }[],
  context: Record<string, any>,   // Conversation context
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `projectId` - Conversations by project
- `clientId` - Conversations by client
- `agentType` - Conversations by agent
- `thread` - Unique thread ID
- Compound: `projectId + agentType + createdAt` - History

### Artifact

Generated artifacts from agents (designs, code, docs).

```typescript
{
  _id: ObjectId,
  projectId: ObjectId,
  taskId?: ObjectId,
  type: ArtifactType,              // design, code, documentation, etc.
  name: string,
  description?: string,
  content: string,                 // Actual content
  fileUrl?: string,                // External storage URL
  metadata: {
    language?: string,
    framework?: string,
    componentType?: string,
    designTool?: string,
    version?: string,
    tags?: string[],
    [key: string]: any
  },
  createdBy: AgentType,
  version: number,                 // Version tracking
  previousVersionId?: ObjectId,    // Previous version
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `projectId` - Artifacts by project
- `taskId` - Artifacts by task
- `type` - Filter by type
- `createdBy` - Filter by agent
- `version` - Version tracking
- Compound: `projectId + type + version` - Latest versions

### Event

Event sourcing log for complete system traceability.

```typescript
{
  _id: ObjectId,
  type: EventType,                 // Event type
  projectId?: ObjectId,
  taskId?: ObjectId,
  agentType?: AgentType,
  payload: Record<string, any>,    // Event data
  timestamp: Date,
  metadata?: Record<string, any>
}
```

**Event Types:**
- `project_created`, `project_updated`, `project_status_changed`
- `task_created`, `task_assigned`, `task_completed`, `task_failed`
- `agent_started`, `agent_completed`, `agent_error`
- `workflow_started`, `workflow_completed`, `workflow_failed`
- `artifact_created`, `client_created`, `message_sent`

**Indexes:**
- `projectId` - Events by project
- `taskId` - Events by task
- `type` - Filter by event type
- `timestamp` - Time-based queries
- Compound: `projectId + timestamp` - Event replay
- Compound: `type + timestamp` - Event filtering

### Agent Execution Log

Detailed logs of agent executions for performance tracking.

```typescript
{
  _id: ObjectId,
  projectId: ObjectId,
  taskId?: ObjectId,
  agentType: AgentType,
  input: Record<string, any>,
  output?: Record<string, any>,
  error?: string,
  duration: number,                // milliseconds
  tokenUsage?: {
    prompt: number,
    completion: number,
    total: number
  },
  createdAt: Date
}
```

**Indexes:**
- `projectId`, `taskId`, `agentType`
- Compound: `agentType + createdAt` - Performance analysis

### Workflow Execution

Workflow execution state for long-running workflows.

```typescript
{
  _id: ObjectId,
  workflowId: string,
  workflowName: string,
  projectId: ObjectId,
  runId: string,                   // Unique run ID
  status: 'running' | 'suspended' | 'completed' | 'failed',
  input: Record<string, any>,
  output?: Record<string, any>,
  currentStep?: string,
  steps: Record<string, any>,
  error?: string,
  createdAt: Date,
  updatedAt: Date,
  completedAt?: Date
}
```

**Indexes:**
- `projectId`, `workflowId`, `runId` (unique)
- `status` - Active workflows
- Compound: `projectId + status` - Project workflows

## 🔐 Validation with Zod

All models include Zod schemas for runtime validation:

```typescript
import { ProjectSchema, CreateProjectSchema } from './models/project';

// Validate existing project
const project = ProjectSchema.parse(data);

// Validate new project (without _id and timestamps)
const newProject = CreateProjectSchema.parse(input);
```

## 🚀 Usage

### Creating a Project

```typescript
import { CreateProjectSchema } from './models/project';
import { getDatabase } from './lib/mongodb';

const projectInput = CreateProjectSchema.parse({
  name: 'New Website',
  description: 'Build a marketing website',
  clientId: new ObjectId('...'),
  status: 'intake',
  currentPhase: 'intake',
  phases: [],
  requirements: {
    description: 'Modern responsive website',
    features: ['Blog', 'Contact Form'],
    technicalStack: ['Next.js', 'TailwindCSS']
  },
  timeline: {
    estimatedStartDate: new Date(),
    estimatedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    milestones: []
  },
  assignedAgents: ['project_manager'],
  metadata: {}
});

const db = await getDatabase();
const result = await db.collection('projects').insertOne({
  ...projectInput,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Querying with Indexes

```typescript
// Get active projects for a client
const projects = await db.collection('projects')
  .find({ 
    clientId: clientId,
    status: { $in: ['research', 'design', 'development', 'qa'] }
  })
  .sort({ createdAt: -1 })
  .toArray();

// Get agent task queue
const tasks = await db.collection('tasks')
  .find({ 
    assignedAgent: 'frontend',
    status: 'pending'
  })
  .sort({ priority: -1, createdAt: 1 })
  .toArray();
```

## 📝 Notes

- All timestamps are stored as JavaScript `Date` objects
- ObjectIds are used for references between collections
- Event sourcing enables full audit trail and time-travel debugging
- Indexes are optimized for common query patterns
- Version tracking on artifacts supports design/code iteration

---

For more information, see the [Main README](../README.md)

