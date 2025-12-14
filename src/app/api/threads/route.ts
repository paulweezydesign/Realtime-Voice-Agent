/**
 * Threads API Route
 * Manages conversation threads - list, create, update, delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemory } from '@/mastra';
import { z } from 'zod';

const CreateThreadSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  title: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/threads?resourceId=xxx
 * List all threads for a resource (user)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const memory = await getMemory();
    
    if (!memory) {
      return NextResponse.json(
        { error: 'Memory system not available' },
        { status: 500 }
      );
    }

    // Get all threads for this resource
    const threads = await memory.getThreadsByResourceId(resourceId);

    return NextResponse.json({
      success: true,
      threads,
    });
  } catch (error) {
    console.error('Get threads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/threads
 * Create a new thread
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateThreadSchema.parse(body);

    const memory = await getMemory();
    
    if (!memory) {
      return NextResponse.json(
        { error: 'Memory system not available' },
        { status: 500 }
      );
    }

    // Generate a unique thread ID
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create the thread
    const thread = await memory.createThread({
      threadId,
      resourceId: validated.resourceId,
      title: validated.title || 'New Conversation',
      metadata: validated.metadata || {},
    });

    return NextResponse.json({
      success: true,
      thread,
    });
  } catch (error) {
    console.error('Create thread error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/threads?threadId=xxx
 * Delete a thread
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    const memory = await getMemory();
    
    if (!memory) {
      return NextResponse.json(
        { error: 'Memory system not available' },
        { status: 500 }
      );
    }

    await memory.deleteThread(threadId);

    return NextResponse.json({
      success: true,
      message: 'Thread deleted successfully',
    });
  } catch (error) {
    console.error('Delete thread error:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}

