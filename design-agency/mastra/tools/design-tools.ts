import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { ArtifactType, AgentType } from '../../types';

/**
 * Tool for creating wireframes
 */
export const createWireframesTool = createTool({
  id: 'create-wireframes',
  description: `Creates wireframes for key user flows and pages. Generates low-fidelity 
    wireframe documentation describing layout, components, and user interactions. Use this 
    at the start of the design phase to establish information architecture.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    pages: z.array(z.object({
      name: z.string(),
      purpose: z.string(),
      components: z.array(z.string()),
    })).describe('List of pages to wireframe'),
    userFlows: z.array(z.string()).describe('Key user flows to document'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    wireframeCount: z.number(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const wireframes = {
      pages: context.pages,
      userFlows: context.userFlows,
      designSystem: {
        layout: 'Responsive grid system with 12 columns',
        spacing: '8px base unit (4px, 8px, 16px, 24px, 32px, 48px)',
        typography: 'Inter font family with 5 size scales',
        colorPalette: 'Primary, secondary, accent, neutral grays, semantic colors',
      },
    };

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DESIGN,
      name: 'Wireframes and User Flows',
      description: `Wireframes for ${context.pages.length} pages and ${context.userFlows.length} user flows`,
      content: JSON.stringify(wireframes, null, 2),
      metadata: {
        pageCount: context.pages.length,
        flowCount: context.userFlows.length,
        designTool: 'Figma',
      },
      createdBy: AgentType.DESIGN,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      wireframeCount: context.pages.length,
    };
  },
});

/**
 * Tool for creating design system
 */
export const createDesignSystemTool = createTool({
  id: 'create-design-system',
  description: `Creates a comprehensive design system with colors, typography, spacing, 
    components, and design tokens. Ensures consistency across the entire application. 
    Use this to establish design standards before creating high-fidelity mockups.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    brandColors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
    }).describe('Brand color palette'),
    designPreferences: z.array(z.string()).describe('Design style preferences (e.g., modern, minimal, bold)'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    tokenCount: z.number(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const designSystem = {
      colors: {
        brand: context.brandColors,
        neutrals: {
          white: '#FFFFFF',
          gray50: '#F9FAFB',
          gray100: '#F3F4F6',
          gray200: '#E5E7EB',
          gray300: '#D1D5DB',
          gray400: '#9CA3AF',
          gray500: '#6B7280',
          gray600: '#4B5563',
          gray700: '#374151',
          gray800: '#1F2937',
          gray900: '#111827',
          black: '#000000',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      typography: {
        fontFamily: {
          sans: 'Inter, system-ui, sans-serif',
          mono: 'JetBrains Mono, monospace',
        },
        fontSize: {
          xs: '12px',
          sm: '14px',
          base: '16px',
          lg: '18px',
          xl: '20px',
          '2xl': '24px',
          '3xl': '30px',
          '4xl': '36px',
          '5xl': '48px',
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      components: {
        button: {
          variants: ['primary', 'secondary', 'outline', 'ghost'],
          sizes: ['sm', 'md', 'lg'],
        },
        input: {
          variants: ['default', 'filled', 'outline'],
          sizes: ['sm', 'md', 'lg'],
        },
        card: {
          variants: ['default', 'elevated', 'outline'],
        },
      },
      designPreferences: context.designPreferences,
    };

    const tokenCount = Object.keys(designSystem.colors.neutrals).length +
                       Object.keys(designSystem.typography.fontSize).length +
                       Object.keys(designSystem.spacing).length;

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DESIGN,
      name: 'Design System',
      description: 'Comprehensive design system with tokens and components',
      content: JSON.stringify(designSystem, null, 2),
      metadata: {
        tokenCount,
        designTool: 'Figma',
        tailwindCompatible: true,
      },
      createdBy: AgentType.DESIGN,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      tokenCount,
    };
  },
});

/**
 * Tool for creating high-fidelity mockups
 */
export const createMockupsTool = createTool({
  id: 'create-mockups',
  description: `Creates high-fidelity mockups for key pages applying the design system. 
    Includes detailed visual design with colors, typography, images, and interactions. 
    Use this after wireframes and design system are established.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    pages: z.array(z.string()).describe('List of page names to mock up'),
    includeMobileViews: z.boolean().default(true).describe('Include mobile responsive views'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    mockupCount: z.number(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const mockups = {
      pages: context.pages.map(page => ({
        name: page,
        desktop: {
          width: '1920px',
          height: 'variable',
          url: `https://design-files.example.com/${projectId}/${page}-desktop.png`,
        },
        tablet: context.includeMobileViews ? {
          width: '768px',
          height: 'variable',
          url: `https://design-files.example.com/${projectId}/${page}-tablet.png`,
        } : undefined,
        mobile: context.includeMobileViews ? {
          width: '375px',
          height: 'variable',
          url: `https://design-files.example.com/${projectId}/${page}-mobile.png`,
        } : undefined,
      })),
      interactionPatterns: [
        'Hover states for buttons and links',
        'Focus states for form inputs',
        'Loading states for async operations',
        'Error states with validation messages',
        'Empty states with helpful guidance',
      ],
      accessibility: {
        colorContrast: 'WCAG AA compliant (4.5:1 minimum)',
        focusIndicators: 'Visible on all interactive elements',
        semanticHTML: 'Proper heading hierarchy and landmarks',
        altText: 'Descriptive for all images',
      },
    };

    const mockupCount = context.pages.length * (context.includeMobileViews ? 3 : 1);

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DESIGN,
      name: 'High-Fidelity Mockups',
      description: `Mockups for ${context.pages.length} pages${context.includeMobileViews ? ' (desktop, tablet, mobile)' : ''}`,
      content: JSON.stringify(mockups, null, 2),
      metadata: {
        pageCount: context.pages.length,
        responsiveViews: context.includeMobileViews,
        designTool: 'Figma',
      },
      createdBy: AgentType.DESIGN,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      mockupCount,
    };
  },
});

/**
 * Tool for creating component specifications
 */
export const createComponentSpecsTool = createTool({
  id: 'create-component-specs',
  description: `Creates detailed specifications for UI components including props, states, 
    variants, and behavior. Serves as a bridge between design and development. Use this to 
    document component requirements for frontend developers.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    components: z.array(z.object({
      name: z.string(),
      description: z.string(),
      variants: z.array(z.string()),
    })).describe('List of components to specify'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    componentCount: z.number(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const specs = {
      components: context.components.map(comp => ({
        name: comp.name,
        description: comp.description,
        variants: comp.variants,
        props: [
          { name: 'className', type: 'string', optional: true, description: 'Additional CSS classes' },
          { name: 'children', type: 'ReactNode', optional: true, description: 'Child content' },
        ],
        states: ['default', 'hover', 'active', 'disabled', 'loading'],
        accessibility: {
          ariaAttributes: ['aria-label', 'aria-describedby'],
          keyboardNavigation: 'Tab, Enter, Space',
          screenReaderSupport: true,
        },
        implementation: {
          framework: 'React 19',
          styling: 'TailwindCSS + shadcn/ui',
          typescript: true,
        },
      })),
    };

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DESIGN,
      name: 'Component Specifications',
      description: `Specifications for ${context.components.length} UI components`,
      content: JSON.stringify(specs, null, 2),
      metadata: {
        componentCount: context.components.length,
        framework: 'React',
        componentLibrary: 'shadcn/ui',
      },
      createdBy: AgentType.DESIGN,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      componentCount: context.components.length,
    };
  },
});

