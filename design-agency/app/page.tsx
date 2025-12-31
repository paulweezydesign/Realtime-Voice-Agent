import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const agents = [
    {
      name: 'Project Manager',
      icon: '🎯',
      description: 'Orchestrates project lifecycle',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Deep Research',
      icon: '🔍',
      description: 'Market & competitor analysis',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Design Agent',
      icon: '🎨',
      description: 'UI/UX and design systems',
      color: 'from-pink-500 to-rose-500',
    },
    {
      name: 'Frontend Agent',
      icon: '⚛️',
      description: 'React & Next.js development',
      color: 'from-orange-500 to-amber-500',
    },
    {
      name: 'Backend Agent',
      icon: '🔧',
      description: 'APIs and databases',
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'QA Agent',
      icon: '✅',
      description: 'Testing & quality assurance',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      name: 'Client Acquisition',
      icon: '💼',
      description: 'Lead gen & proposals',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            AI-Powered Design Agency
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Built with Mastra.ai, Next.js 15, and MongoDB. 
            Seven specialized AI agents work together to deliver exceptional design and development projects.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Go to Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white hover:bg-white/20">
              View Documentation
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {agents.map((agent, idx) => (
            <Card 
              key={idx} 
              className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-3xl mb-4`}>
                  {agent.icon}
                </div>
                <CardTitle className="text-white">{agent.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {agent.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Workflow Section */}
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Automated Workflows</CardTitle>
            <CardDescription className="text-gray-400">
              Complete project lifecycle automation from lead to delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Lifecycle */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                🔄 Project Lifecycle Workflow
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {['Intake', 'Research', 'Design', 'Development', 'QA', 'Review', 'Completed'].map((phase, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">
                      {phase}
                    </div>
                    {idx < 6 && (
                      <div className="mx-2 text-white">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Client Onboarding */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                💼 Client Onboarding Workflow
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {['Qualify Lead', 'Create Proposal', 'Initialize Project'].map((phase, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">
                      {phase}
                    </div>
                    {idx < 2 && (
                      <div className="mx-2 text-white">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Built With</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Mastra.ai', 
              'Next.js 15', 
              'React 19', 
              'TypeScript', 
              'MongoDB', 
              'TailwindCSS', 
              'shadcn/ui',
              'OpenAI GPT-4o'
            ].map((tech, idx) => (
              <div key={idx} className="px-6 py-3 bg-white/10 rounded-full text-white font-medium">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>© 2025 AI-Powered Design Agency. Built with Mastra.ai Framework.</p>
        </div>
      </footer>
    </div>
  );
}

