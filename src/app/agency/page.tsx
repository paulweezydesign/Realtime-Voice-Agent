/**
 * Agency Page
 * Main page for interacting with the multi-agent development agency
 */

import AgencyInterfaceWithMemory from '@/components/AgencyInterfaceWithMemory';

export default function AgencyPage() {
  return (
    <main className="h-screen w-full">
      <AgencyInterfaceWithMemory />
    </main>
  );
}

export const metadata = {
  title: 'Development Agency | Mastra AI',
  description: 'Multi-agent AI development agency with conversation history and streaming responses',
};
