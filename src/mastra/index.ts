/**
 * Mastra Instance Configuration
 * Registers all agents and configures the multi-agent development agency
 */

import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';

// Import all agents
import { projectManagerAgent } from './agents/project-manager';
import { deepResearchAgent } from './agents/deep-research';
import { designAgent } from './agents/design';
import { frontendAgent } from './agents/frontend';
import { backendAgent } from './agents/backend';
import { qaAgent } from './agents/qa';
import { clientAcquisitionAgent } from './agents/client-acquisition';
import { chatAgent } from './agents/chatAgent'; // Existing voice agent

/**
 * Main Mastra instance with all registered agents and storage
 */
export const mastra = new Mastra({
  agents: {
    // Development Agency Agents
    projectManager: projectManagerAgent,
    deepResearch: deepResearchAgent,
    design: designAgent,
    frontend: frontendAgent,
    backend: backendAgent,
    qa: qaAgent,
    clientAcquisition: clientAcquisitionAgent,
    
    // Existing agents
    chatAgent,
  },
  storage: new LibSQLStore({
    url: process.env.DATABASE_URL || 'file:./agency-conversations.db',
  }),
});

/**
 * Helper function to get a specific agent
 */
export const getAgent = (agentName: keyof typeof mastra.agents) => {
  return mastra.getAgent(agentName);
};

/**
 * Helper function to get the project manager (main entry point)
 */
export const getProjectManager = () => {
  return mastra.getAgent('projectManager');
};

/**
 * Helper function to get the memory instance for conversation management
 */
export const getMemory = () => {
  return projectManagerAgent.getMemory();
};

/**
 * Type-safe agent names
 */
export type AgentName = keyof typeof mastra.agents;

/**
 * Export individual agents for direct access if needed
 */
export {
  projectManagerAgent,
  deepResearchAgent,
  designAgent,
  frontendAgent,
  backendAgent,
  qaAgent,
  clientAcquisitionAgent,
  chatAgent,
};
