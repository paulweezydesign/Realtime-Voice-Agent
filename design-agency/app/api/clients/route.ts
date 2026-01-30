import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/lib/mongodb';

const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  status: z.enum(['lead', 'qualified', 'active', 'inactive']),
});

/**
 * GET /api/clients
 * List all clients with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();
    const query: any = {};
    
    if (status) query.status = status;

    const clients = await db
      .collection('clients')
      .find(query)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      clients,
      total: clients.length 
    });
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createClientSchema.parse(body);

    const db = await getDatabase();
    const client = await db.collection('clients').insertOne({
      name: data.name,
      email: data.email,
      company: data.company || '',
      phone: data.phone || '',
      website: data.website || '',
      industry: data.industry || '',
      status: data.status,
      leadScore: 0,
      projects: [],
      contactHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Log event
    await db.collection('events').insertOne({
      clientId: client.insertedId,
      type: 'client_created',
      data: { 
        clientName: data.name,
        status: data.status 
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      clientId: client.insertedId.toString(),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/clients error:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

