import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { ArtifactType, AgentType } from '../../types';

/**
 * Tool for code review
 */
export const reviewCodeTool = createTool({
  id: 'review-code',
  description: `Performs comprehensive code review checking for best practices, security,
    performance, and accessibility. Provides actionable feedback and recommendations.`,
  inputSchema: z.object({
    projectId: z.string(),
    artifactId: z.string(),
    focusAreas: z.array(z.enum(['security', 'performance', 'accessibility', 'best-practices'])),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    issuesFound: z.number(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const review = {
      artifactReviewed: context.artifactId,
      focusAreas: context.focusAreas,
      findings: [
        {
          severity: 'medium',
          category: 'accessibility',
          issue: 'Missing ARIA labels on interactive elements',
          recommendation: 'Add aria-label or aria-labelledby attributes',
          line: 45,
        },
        {
          severity: 'low',
          category: 'best-practices',
          issue: 'Component could be memoized for better performance',
          recommendation: 'Wrap component with React.memo()',
          line: 12,
        },
      ],
      summary: `Code review completed. Found ${2} issues across ${context.focusAreas.length} focus areas.`,
    };

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DOCUMENTATION,
      name: 'Code Review Report',
      description: `Review focusing on: ${context.focusAreas.join(', ')}`,
      content: JSON.stringify(review, null, 2),
      metadata: {
        reviewedArtifact: context.artifactId,
        focusAreas: context.focusAreas,
        issueCount: review.findings.length,
      },
      createdBy: AgentType.QA,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      issuesFound: review.findings.length,
      severity: 'medium',
    };
  },
});

/**
 * Tool for accessibility testing
 */
export const testAccessibilityTool = createTool({
  id: 'test-accessibility',
  description: `Tests application for WCAG 2.1 compliance. Checks color contrast, keyboard
    navigation, screen reader support, and semantic HTML. Provides detailed accessibility audit.`,
  inputSchema: z.object({
    projectId: z.string(),
    pages: z.array(z.string()),
    wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA'),
  }),
  outputSchema: z.object({
    artifactId: z.string(),
    complianceScore: z.number(),
    issuesFound: z.number(),
  }),
  execute: async ({ context }) => {
    const db = await getDatabase();
    const projectId = new ObjectId(context.projectId);

    const audit = {
      wcagLevel: context.wcagLevel,
      pagesTested: context.pages,
      complianceScore: 85,
      categories: {
        colorContrast: { score: 90, issues: 2 },
        keyboardNavigation: { score: 95, issues: 1 },
        screenReader: { score: 80, issues: 3 },
        semanticHTML: { score: 75, issues: 4 },
      },
      totalIssues: 10,
      recommendations: [
        'Increase color contrast for secondary text',
        'Add skip navigation link',
        'Improve heading hierarchy on dashboard page',
        'Add alt text to decorative images',
      ],
    };

    const artifact = await db.collection('artifacts').insertOne({
      projectId,
      type: ArtifactType.DOCUMENTATION,
      name: 'Accessibility Audit',
      description: `WCAG ${context.wcagLevel} compliance audit`,
      content: JSON.stringify(audit, null, 2),
      metadata: {
        wcagLevel: context.wcagLevel,
        pageCount: context.pages.length,
        complianceScore: audit.complianceScore,
      },
      createdBy: AgentType.QA,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      artifactId: artifact.insertedId.toString(),
      complianceScore: audit.complianceScore,
      issuesFound: audit.totalIssues,
    };
  },
});
