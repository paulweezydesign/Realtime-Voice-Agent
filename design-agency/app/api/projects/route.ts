import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  clientId: z.string(),
  requirements: z.string().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
});

/**
 * GET /api/projects
 * List all projects with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDatabase();
    const query: any = {};
    
    if (status) query.status = status;
    if (clientId) query.clientId = new ObjectId(clientId);

    const projects = await db
      .collection('projects')
      .find(query)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      projects,
      total: projects.length 
    });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const db = await getDatabase();
    const project = await db.collection('projects').insertOne({
      name: data.name,
      description: data.description,
      clientId: new ObjectId(data.clientId),
      status: 'intake',
      requirements: data.requirements || '',
      timeline: data.timeline || '',
      budget: data.budget || '',
      assignedAgents: ['project-manager'],
      tasks: [],
      artifacts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Log event
    await db.collection('events').insertOne({
      projectId: project.insertedId,
      type: 'project_created',
      data: { projectName: data.name },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      projectId: project.insertedId.toString(),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

