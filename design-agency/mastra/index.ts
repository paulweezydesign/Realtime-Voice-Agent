import { Mastra } from '@mastra/core/mastra';
import { MongoDBStore } from '@mastra/mongodb';
import { PinoLogger } from '@mastra/core/logger';

// Import agents (will be created in next steps)
// import { projectManagerAgent } from './agents/project-manager';
// import { deepResearchAgent } from './agents/deep-research';
// import { designAgent } from './agents/design';
// import { frontendAgent } from './agents/frontend';
// import { backendAgent } from './agents/backend';
// import { qaAgent } from './agents/qa';
// import { clientAcquisitionAgent } from './agents/client-acquisition';

// Import workflows (will be created in next steps)
// import { projectLifecycleWorkflow } from './workflows/project-lifecycle';
// import { clientOnboardingWorkflow } from './workflows/client-onboarding';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/design-agency';

export const mastra = new Mastra({
  agents: {
    // Will be populated as we create agents
    // projectManagerAgent,
    // deepResearchAgent,
    // designAgent,
    // frontendAgent,
    // backendAgent,
    // qaAgent,
    // clientAcquisitionAgent,
  },
  workflows: {
    // Will be populated as we create workflows
    // projectLifecycleWorkflow,
    // clientOnboardingWorkflow,
  },
  storage: new MongoDBStore({
    connectionString: mongoUri,
  }),
  logger: new PinoLogger({
    name: 'DesignAgency',
    level: 'info',
  }),
});

export default mastra;

