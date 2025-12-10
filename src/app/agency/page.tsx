/**
 * Agency Page
 * Main page for interacting with the multi-agent development agency
 */

import AgencyInterfaceEnhanced from '@/components/AgencyInterfaceEnhanced';

export default function AgencyPage() {
  return (
    <main className="h-screen w-full">
      <AgencyInterfaceEnhanced />
    </main>
  );
}

export const metadata = {
  title: 'Development Agency | Mastra AI',
  description: 'Multi-agent AI development agency powered by Mastra.ai with streaming responses',
};

