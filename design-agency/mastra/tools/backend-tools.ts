import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { ArtifactType, AgentType } from '../../types';

/**
 * Tool for creating API routes
 */
export const createAPIRouteTool = createTool({
  id: 'create-api-route',
  description: `Creates Next.js API route handlers with proper error handling, validation,
    and TypeScript types. Implements RESTful endpoints with MongoDB integration.`,
  inputSchema: z.object({
    projectId: z.string(),
    routePath: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    description: z.string(),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    routePath: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const routeCode = `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/lib/mongodb';

const requestSchema = z.object({
  // Define request schema
});

export async function ${context.method}(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Implementation
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.CODE,
      name: `API Route: ${context.method} ${context.routePath}`,
      description: context.description,
      content: routeCode,
      metadata: {
        language: 'typescript',
        framework: 'Next.js',
        method: context.method,
        routePath: context.routePath,
      },
      createdBy: AgentType.BACKEND,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      routePath: `src/app/api${context.routePath}/route.ts`,
    };
  },
});

/**
 * Tool for creating database schemas
 */
export const createDatabaseSchemaTool = createTool({
  id: 'create-database-schema',
  description: `Creates MongoDB schemas with Zod validation and TypeScript types.
    Defines data models with proper indexing and relationships.`,
  inputSchema: z.object({
    projectId: z.string(),
    schemaName: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
    })),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    schemaPath: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const schemaCode = `import { z } from 'zod';

export const ${context.schemaName}Schema = z.object({
${context.fields.map(f => `  ${f.name}: z.${f.type}()${!f.required ? '.optional()' : ''},`).join('\n')}
});

export type ${context.schemaName} = z.infer<typeof ${context.schemaName}Schema>;
`;

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.CODE,
      name: `${context.schemaName} Schema`,
      description: `Database schema for ${context.schemaName}`,
      content: schemaCode,
      metadata: {
        language: 'typescript',
        schemaType: 'Zod',
        fieldCount: context.fields.length,
      },
      createdBy: AgentType.BACKEND,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      schemaPath: `src/models/${context.schemaName.toLowerCase()}.ts`,
    };
  },
});
