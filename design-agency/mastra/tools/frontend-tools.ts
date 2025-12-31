import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { ArtifactType, AgentType } from '../../types';

/**
 * Tool for generating React components
 */
export const generateComponentTool = createTool({
  id: 'generate-component',
  description: `Generates React component code with TypeScript, TailwindCSS styling, and shadcn/ui integration.
    Creates fully typed, accessible components following best practices. Use this to implement
    designed components from the design phase.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID'),
    componentName: z.string().describe('Component name (PascalCase)'),
    description: z.string().describe('Component purpose and functionality'),
    props: z.array(z.object({
      name: z.string(),
      type: z.string(),
      optional: z.boolean(),
      description: z.string(),
    })).describe('Component props'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    componentPath: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const componentCode = `import * as React from 'react';
import { cn } from '@/lib/utils';

interface ${context.componentName}Props {
${context.props.map(p => `  ${p.name}${p.optional ? '?' : ''}: ${p.type}; // ${p.description}`).join('\n')}
}

/**
 * ${context.description}
 */
export const ${context.componentName} = React.forwardRef<
  HTMLDivElement,
  ${context.componentName}Props
>(({ ${context.props.map(p => p.name).join(', ')}, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {/* Component implementation */}
    </div>
  );
});

${context.componentName}.displayName = '${context.componentName}';
`;

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.CODE,
      name: `${context.componentName} Component`,
      description: context.description,
      content: componentCode,
      metadata: {
        language: 'typescript',
        framework: 'React',
        componentType: 'UI',
      },
      createdBy: AgentType.FRONTEND,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      componentPath: `src/components/ui/${context.componentName.toLowerCase()}.tsx`,
    };
  },
});

/**
 * Tool for implementing pages
 */
export const implementPageTool = createTool({
  id: 'implement-page',
  description: `Implements full page components with layouts, data fetching, and routing.
    Creates Next.js pages with Server Components, client components, and proper TypeScript types.`,
  inputSchema: z.object({
    projectId: z.string(),
    pageName: z.string(),
    route: z.string(),
    components: z.array(z.string()),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    pagePath: z.string(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const pageCode = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${context.pageName}',
  description: '${context.pageName} page',
};

export default async function ${context.pageName}Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">${context.pageName}</h1>
      {/* Page content using components: ${context.components.join(', ')} */}
    </main>
  );
}
`;

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.CODE,
      name: `${context.pageName} Page`,
      description: `Page implementation for route: ${context.route}`,
      content: pageCode,
      metadata: {
        language: 'typescript',
        framework: 'Next.js',
        route: context.route,
        components: context.components,
      },
      createdBy: AgentType.FRONTEND,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      pagePath: `src/app${context.route}/page.tsx`,
    };
  },
});

