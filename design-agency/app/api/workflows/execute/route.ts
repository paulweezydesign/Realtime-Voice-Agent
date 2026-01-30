import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mastra } from '@/mastra';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const executeWorkflowSchema = z.object({
  workflowName: z.enum(['project-lifecycle', 'client-onboarding']),
  triggerData: z.record(z.any()),
});

/**
 * POST /api/workflows/execute
 * Execute a workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowName, triggerData } = executeWorkflowSchema.parse(body);

    // Get the workflow from Mastra
    const workflow = mastra.getWorkflow(workflowName);
    if (!workflow) {
      return NextResponse.json(
        { error: `Workflow "${workflowName}" not found` },
        { status: 404 }
      );
    }

    // Execute the workflow
    const result = await workflow.execute({
      triggerData,
    });

    // Log execution to database
    const db = await getDatabase();
    const executionLog = {
      workflowName,
      triggerData,
      result: result.results,
      status: result.status,
      timestamp: new Date(),
    };
    
    await db.collection('workflowExecutions').insertOne(executionLog);

    // If projectId in trigger data, also log as event
    if (triggerData.projectId) {
      await db.collection('events').insertOne({
        projectId: new ObjectId(triggerData.projectId),
        type: 'workflow_executed',
        data: {
          workflowName,
          status: result.status,
        },
        timestamp: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      workflowName,
      status: result.status,
      results: result.results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/workflows/execute error:', error);
    return NextResponse.json(
      { error: 'Failed to execute workflow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflows/execute
 * List all available workflows
 */
export async function GET(request: NextRequest) {
  try {
    const workflows = [
      {
        name: 'project-lifecycle',
        description: 'Automated project lifecycle from intake to completion',
        steps: [
          'Initialize Project',
          'Conduct Research',
          'Create Design',
          'Implement Frontend & Backend',
          'QA Review',
          'Final Review'
        ],
        triggerDataSchema: {
          projectId: 'string (MongoDB ObjectId)',
          projectName: 'string',
          clientId: 'string (MongoDB ObjectId)',
        }
      },
      {
        name: 'client-onboarding',
        description: 'Automated client onboarding from lead to project',
        steps: [
          'Qualify Lead',
          'Generate Proposal',
          'Initialize Project'
        ],
        triggerDataSchema: {
          clientId: 'string (MongoDB ObjectId)',
          clientName: 'string',
          clientEmail: 'string',
        }
      }
    ];

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('GET /api/workflows/execute error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

