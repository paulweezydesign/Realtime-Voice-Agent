/**
 * Agency Streaming Chat API Route
 * Handles streaming chat interactions with the project manager agent
 */

import { NextRequest } from 'next/server';
import { getProjectManager } from '@/mastra';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  conversationId: z.string().optional(),
  context: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = ChatRequestSchema.parse(body);
    
    // Get the project manager agent
    const projectManager = getProjectManager();
    
    if (!projectManager) {
      return new Response(
        JSON.stringify({ error: 'Project manager agent not available' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Stream response from the project manager
    const stream = await projectManager.stream(validated.message, {
      context: validated.context,
    });
    
    // Create a ReadableStream that forwards the agent's stream
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Stream text chunks
          for await (const chunk of stream.textStream) {
            const data = JSON.stringify({
              type: 'text',
              content: chunk,
            });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }
          
          // Get tool calls after streaming completes
          const fullOutput = await stream.fullOutput();
          
          if (fullOutput.toolCalls && fullOutput.toolCalls.length > 0) {
            const toolCallsData = JSON.stringify({
              type: 'toolCalls',
              toolCalls: fullOutput.toolCalls,
            });
            controller.enqueue(new TextEncoder().encode(`data: ${toolCallsData}\n\n`));
          }
          
          // Send done signal
          const doneData = JSON.stringify({ type: 'done' });
          controller.enqueue(new TextEncoder().encode(`data: ${doneData}\n\n`));
          
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Stream processing failed',
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });
    
    // Return streaming response with proper headers
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('Agency stream error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          issues: error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to process stream request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

