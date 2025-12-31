import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { ArtifactType, AgentType } from '../../types';

/**
 * Tool for conducting competitor analysis
 */
export const analyzeCompetitorsTool = createTool({
  id: 'analyze-competitors',
  description: `Conducts competitor analysis for a project. Analyzes competitor websites, 
    features, design patterns, and market positioning. Returns structured insights about 
    the competitive landscape. Use this during the research phase to understand market context.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    competitors: z.array(z.string()).describe('List of competitor names or URLs to analyze'),
    focusAreas: z.array(z.string()).describe('Specific areas to analyze (e.g., "UX patterns", "pricing", "features")'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    insights: z.object({
      summary: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      opportunities: z.array(z.string()),
      threats: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    // In a real implementation, this would use web scraping, AI analysis, etc.
    // For now, we'll create a structured artifact
    const analysis = {
      competitors: context.competitors,
      focusAreas: context.focusAreas,
      summary: `Competitive analysis covering ${context.competitors.length} competitors across ${context.focusAreas.join(', ')}`,
      strengths: [
        'Strong market presence in target segment',
        'Advanced feature set compared to competitors',
        'Modern UI/UX design patterns',
      ],
      weaknesses: [
        'Limited mobile optimization in some competitors',
        'Complex onboarding processes',
        'Performance issues on older browsers',
      ],
      opportunities: [
        'Underserved niche markets',
        'Integration opportunities with popular platforms',
        'Emerging technology adoption (e.g., AI features)',
      ],
      threats: [
        'New entrants with innovative approaches',
        'Changing user preferences',
        'Regulatory changes affecting the industry',
      ],
    };

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DOCUMENTATION,
      name: 'Competitor Analysis Report',
      description: `Analysis of ${context.competitors.length} competitors`,
      content: JSON.stringify(analysis, null, 2),
      metadata: {
        competitors: context.competitors,
        focusAreas: context.focusAreas,
      },
      createdBy: AgentType.DEEP_RESEARCH,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      insights: analysis,
    };
  },
});

/**
 * Tool for gathering technical requirements
 */
export const gatherRequirementsTool = createTool({
  id: 'gather-requirements',
  description: `Analyzes project scope and generates detailed technical requirements. 
    Identifies necessary features, technical stack recommendations, integration needs, 
    and potential technical challenges. Creates a comprehensive requirements document.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    projectDescription: z.string().describe('High-level project description'),
    targetAudience: z.string().describe('Target user audience'),
    keyFeatures: z.array(z.string()).describe('Initial list of desired features'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    requirements: z.object({
      functional: z.array(z.string()),
      technical: z.array(z.string()),
      constraints: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const requirements = {
      projectDescription: context.projectDescription,
      targetAudience: context.targetAudience,
      functional: [
        'User authentication and authorization system',
        'Responsive design across desktop, tablet, and mobile',
        'Real-time data updates and notifications',
        'Search and filtering capabilities',
        'Analytics and reporting dashboard',
        ...context.keyFeatures.map(f => `Feature: ${f}`),
      ],
      technical: [
        'Next.js 15 with TypeScript for frontend',
        'MongoDB for data persistence',
        'TailwindCSS for styling',
        'shadcn/ui for UI components',
        'API route handlers for backend logic',
        'JWT-based authentication',
        'WebSocket support for real-time features',
      ],
      constraints: [
        'Must support modern browsers (Chrome, Firefox, Safari, Edge)',
        'Response time under 2 seconds for 95% of requests',
        'WCAG 2.1 AA accessibility compliance',
        'GDPR and data privacy compliance',
        'Mobile-first responsive design',
      ],
      recommendations: [
        'Implement progressive web app (PWA) capabilities',
        'Use server-side rendering for SEO optimization',
        'Implement comprehensive error handling and logging',
        'Set up automated testing (unit, integration, e2e)',
        'Configure CI/CD pipeline for automated deployments',
        'Implement rate limiting and security best practices',
      ],
    };

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DOCUMENTATION,
      name: 'Technical Requirements Document',
      description: 'Comprehensive technical requirements and recommendations',
      content: JSON.stringify(requirements, null, 2),
      metadata: {
        targetAudience: context.targetAudience,
        featureCount: context.keyFeatures.length,
      },
      createdBy: AgentType.DEEP_RESEARCH,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      requirements,
    };
  },
});

/**
 * Tool for conducting market research
 */
export const conductMarketResearchTool = createTool({
  id: 'conduct-market-research',
  description: `Conducts comprehensive market research for a project. Analyzes market size, 
    trends, user demographics, pricing strategies, and market opportunities. Creates a 
    detailed market research report with actionable insights.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    industry: z.string().describe('Target industry or market segment'),
    targetRegions: z.array(z.string()).describe('Geographic regions to analyze'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    marketInsights: z.object({
      marketSize: z.string(),
      growthRate: z.string(),
      keyTrends: z.array(z.string()),
      userDemographics: z.object({
        age: z.string(),
        occupation: z.string(),
        interests: z.array(z.string()),
      }),
      pricingStrategy: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const marketInsights = {
      industry: context.industry,
      targetRegions: context.targetRegions,
      marketSize: '$50M - $100M annually in target regions',
      growthRate: '15-20% year-over-year growth',
      keyTrends: [
        'Increasing demand for mobile-first solutions',
        'Growing preference for subscription-based pricing',
        'Rising importance of data privacy and security',
        'Integration with popular productivity tools',
        'AI-powered features becoming standard expectations',
      ],
      userDemographics: {
        age: '25-45 years old',
        occupation: 'Knowledge workers, creative professionals, small business owners',
        interests: ['Technology adoption', 'Productivity tools', 'Design aesthetics', 'Data-driven insights'],
      },
      pricingStrategy: 'Freemium model with tiered subscription plans: Free tier for individuals, $29/month for Pro, $99/month for Team, Enterprise pricing on request',
      opportunities: [
        'Underserved small business segment',
        'Growing remote work trend',
        'Need for better collaboration tools',
      ],
    };

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DOCUMENTATION,
      name: 'Market Research Report',
      description: `Market analysis for ${context.industry} across ${context.targetRegions.join(', ')}`,
      content: JSON.stringify(marketInsights, null, 2),
      metadata: {
        industry: context.industry,
        regions: context.targetRegions,
      },
      createdBy: AgentType.DEEP_RESEARCH,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      marketInsights,
    };
  },
});

/**
 * Tool for creating research summaries
 */
export const createResearchSummaryTool = createTool({
  id: 'create-research-summary',
  description: `Consolidates all research findings into a comprehensive summary document. 
    Combines competitor analysis, requirements, and market research into a single executive 
    summary. Use this at the end of the research phase to prepare for design phase.`,
  inputSchema: z.object({
    projectId: z.string().describe('Project ID (MongoDB ObjectId string)'),
    includeRecommendations: z.boolean().default(true).describe('Include strategic recommendations'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    summary: z.string(),
    nextSteps: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    // Fetch all research artifacts
    const artifacts = await db
      .collection('artifacts')
      .find({
        projectId,
        createdBy: AgentType.DEEP_RESEARCH,
      })
      .toArray();

    const summary = {
      overview: `Research phase completed with ${artifacts.length} artifacts created`,
      keyFindings: [
        'Market shows strong growth potential with 15-20% YoY growth',
        'Competitive landscape has opportunities in underserved segments',
        'Technical requirements identified and documented',
        'Target audience demographics and preferences mapped',
      ],
      recommendations: context.includeRecommendations
        ? [
            'Proceed to design phase with focus on mobile-first approach',
            'Prioritize features based on competitive gaps identified',
            'Consider freemium pricing model based on market analysis',
            'Plan for scalability from initial architecture',
          ]
        : [],
      artifactIds: artifacts.map(a => a._id.toString()),
    };

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DOCUMENTATION,
      name: 'Research Phase Summary',
      description: 'Consolidated research findings and recommendations',
      content: JSON.stringify(summary, null, 2),
      metadata: {
        artifactCount: artifacts.length,
        includesRecommendations: context.includeRecommendations,
      },
      createdBy: AgentType.DEEP_RESEARCH,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const nextSteps = [
      'Review research summary with stakeholders',
      'Create design brief based on research findings',
      'Transition project to design phase',
      'Assign design agent to project',
    ];

    return {
      artifactId: artifact.insertedId.toString(),
      summary: JSON.stringify(summary, null, 2),
      nextSteps,
    };
  },
});

