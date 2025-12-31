import { Db } from 'mongodb';

/**
 * Create MongoDB indexes for optimal query performance
 * Run this once during application setup
 */
export async function createIndexes(db: Db): Promise<void> {
  console.log('Creating MongoDB indexes...');

  // ============================================
  // PROJECTS COLLECTION INDEXES
  // ============================================
  await db.collection('projects').createIndexes([
    { key: { clientId: 1 }, name: 'idx_projects_clientId' },
    { key: { status: 1 }, name: 'idx_projects_status' },
    { key: { currentPhase: 1 }, name: 'idx_projects_currentPhase' },
    { key: { createdAt: -1 }, name: 'idx_projects_createdAt' },
    { key: { 'timeline.estimatedEndDate': 1 }, name: 'idx_projects_estimatedEndDate' },
    // Compound index for querying active projects by client
    { key: { clientId: 1, status: 1 }, name: 'idx_projects_client_status' },
  ]);

  // ============================================
  // TASKS COLLECTION INDEXES
  // ============================================
  await db.collection('tasks').createIndexes([
    { key: { projectId: 1 }, name: 'idx_tasks_projectId' },
    { key: { assignedAgent: 1 }, name: 'idx_tasks_assignedAgent' },
    { key: { status: 1 }, name: 'idx_tasks_status' },
    { key: { priority: 1 }, name: 'idx_tasks_priority' },
    { key: { createdAt: -1 }, name: 'idx_tasks_createdAt' },
    // Compound index for querying tasks by project and status
    { key: { projectId: 1, status: 1 }, name: 'idx_tasks_project_status' },
    // Compound index for agent task queue
    { key: { assignedAgent: 1, status: 1, priority: -1 }, name: 'idx_tasks_agent_queue' },
  ]);

  // ============================================
  // CLIENTS COLLECTION INDEXES
  // ============================================
  await db.collection('clients').createIndexes([
    { key: { 'contactInfo.email': 1 }, name: 'idx_clients_email', unique: true },
    { key: { status: 1 }, name: 'idx_clients_status' },
    { key: { leadSource: 1 }, name: 'idx_clients_leadSource' },
    { key: { qualificationScore: -1 }, name: 'idx_clients_qualificationScore' },
    { key: { createdAt: -1 }, name: 'idx_clients_createdAt' },
  ]);

  // ============================================
  // CONVERSATIONS COLLECTION INDEXES
  // ============================================
  await db.collection('conversations').createIndexes([
    { key: { projectId: 1 }, name: 'idx_conversations_projectId' },
    { key: { clientId: 1 }, name: 'idx_conversations_clientId' },
    { key: { agentType: 1 }, name: 'idx_conversations_agentType' },
    { key: { thread: 1 }, name: 'idx_conversations_thread' },
    { key: { createdAt: -1 }, name: 'idx_conversations_createdAt' },
    // Compound index for retrieving conversation history
    { key: { projectId: 1, agentType: 1, createdAt: -1 }, name: 'idx_conversations_project_agent' },
  ]);

  // ============================================
  // ARTIFACTS COLLECTION INDEXES
  // ============================================
  await db.collection('artifacts').createIndexes([
    { key: { projectId: 1 }, name: 'idx_artifacts_projectId' },
    { key: { taskId: 1 }, name: 'idx_artifacts_taskId' },
    { key: { type: 1 }, name: 'idx_artifacts_type' },
    { key: { createdBy: 1 }, name: 'idx_artifacts_createdBy' },
    { key: { version: 1 }, name: 'idx_artifacts_version' },
    { key: { createdAt: -1 }, name: 'idx_artifacts_createdAt' },
    // Compound index for versioned artifacts
    { key: { projectId: 1, type: 1, version: -1 }, name: 'idx_artifacts_project_type_version' },
  ]);

  // ============================================
  // EVENTS COLLECTION INDEXES (Event Sourcing)
  // ============================================
  await db.collection('events').createIndexes([
    { key: { projectId: 1 }, name: 'idx_events_projectId' },
    { key: { taskId: 1 }, name: 'idx_events_taskId' },
    { key: { type: 1 }, name: 'idx_events_type' },
    { key: { agentType: 1 }, name: 'idx_events_agentType' },
    { key: { timestamp: -1 }, name: 'idx_events_timestamp' },
    // Compound index for event replay
    { key: { projectId: 1, timestamp: 1 }, name: 'idx_events_project_timestamp' },
    // Compound index for filtering events by type
    { key: { type: 1, timestamp: -1 }, name: 'idx_events_type_timestamp' },
  ]);

  // ============================================
  // AGENT EXECUTION LOGS COLLECTION INDEXES
  // ============================================
  await db.collection('agent_execution_logs').createIndexes([
    { key: { projectId: 1 }, name: 'idx_execution_logs_projectId' },
    { key: { taskId: 1 }, name: 'idx_execution_logs_taskId' },
    { key: { agentType: 1 }, name: 'idx_execution_logs_agentType' },
    { key: { createdAt: -1 }, name: 'idx_execution_logs_createdAt' },
    // Compound index for agent performance analysis
    { key: { agentType: 1, createdAt: -1 }, name: 'idx_execution_logs_agent_time' },
  ]);

  // ============================================
  // WORKFLOW EXECUTIONS COLLECTION INDEXES
  // ============================================
  await db.collection('workflow_executions').createIndexes([
    { key: { projectId: 1 }, name: 'idx_workflow_executions_projectId' },
    { key: { workflowId: 1 }, name: 'idx_workflow_executions_workflowId' },
    { key: { runId: 1 }, name: 'idx_workflow_executions_runId', unique: true },
    { key: { status: 1 }, name: 'idx_workflow_executions_status' },
    { key: { createdAt: -1 }, name: 'idx_workflow_executions_createdAt' },
    // Compound index for monitoring active workflows
    { key: { projectId: 1, status: 1 }, name: 'idx_workflow_executions_project_status' },
  ]);

  console.log('✅ MongoDB indexes created successfully');
}

/**
 * Drop all indexes (useful for development/testing)
 */
export async function dropIndexes(db: Db): Promise<void> {
  console.log('Dropping MongoDB indexes...');

  const collections = [
    'projects',
    'tasks',
    'clients',
    'conversations',
    'artifacts',
    'events',
    'agent_execution_logs',
    'workflow_executions',
  ];

  for (const collectionName of collections) {
    try {
      await db.collection(collectionName).dropIndexes();
      console.log(`✅ Dropped indexes for ${collectionName}`);
    } catch (error) {
      console.log(`⚠️  Could not drop indexes for ${collectionName}:`, error);
    }
  }

  console.log('✅ All indexes dropped');
}

