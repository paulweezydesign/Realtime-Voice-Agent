'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  clientId: string;
  requirements?: string;
  timeline?: string;
  budget?: string;
  assignedAgents: string[];
  tasks: any[];
  artifacts: any[];
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  assignedAgent: string;
  createdAt: string;
}

interface Artifact {
  _id: string;
  type: string;
  title: string;
  content: string;
  agentName: string;
  createdAt: string;
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }

      const data = await response.json();
      setProject(data.project);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      intake: 'bg-blue-500',
      research: 'bg-purple-500',
      design: 'bg-pink-500',
      development: 'bg-orange-500',
      qa: 'bg-yellow-500',
      review: 'bg-green-500',
      completed: 'bg-emerald-500',
      on_hold: 'bg-gray-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const handleExecuteAgent = async (agentName: string) => {
    const prompt = window.prompt(`Enter prompt for ${agentName} agent:`);
    if (!prompt) return;

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName,
          prompt,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute agent');
      }

      alert('Agent executed successfully! Check execution logs for results.');
      fetchProjectDetails(); // Refresh project data
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateStatus = async () => {
    const newStatus = window.prompt(
      'Enter new status (intake, research, design, development, qa, review, completed, on_hold, cancelled):',
      project?.status
    );
    
    if (!newStatus) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      alert('Status updated successfully!');
      fetchProjectDetails(); // Refresh project data
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </Button>
        <div className="mt-8 text-center">
          <p className="text-red-600 text-lg">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-4">
          ← Back to Dashboard
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Button onClick={handleUpdateStatus} variant="outline" size="sm">
              Update Status
            </Button>
          </div>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{project.timeline || 'Not specified'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{project.budget || 'Not specified'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">
                {project.requirements || 'No requirements specified'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Project ID:</span> {project._id}
              </div>
              <div>
                <span className="font-medium">Client ID:</span> {project.clientId}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(project.updatedAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Agents</CardTitle>
              <CardDescription>
                Agents currently working on this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.assignedAgents.map((agent, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🤖</span>
                      <span className="font-medium">{agent}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleExecuteAgent(agent)}
                    >
                      Execute
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleExecuteAgent('project-manager')}
              >
                🎯 Execute Project Manager
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleExecuteAgent('deep-research')}
              >
                🔍 Execute Deep Research
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleExecuteAgent('design')}
              >
                🎨 Execute Design Agent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>
                {project.tasks.length} task(s) in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tasks yet. Execute agents to create tasks.
                </p>
              ) : (
                <div className="space-y-2">
                  {project.tasks.map((task, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{task.title || `Task ${idx + 1}`}</span>
                        <Badge>{task.status || 'pending'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artifacts Tab */}
        <TabsContent value="artifacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Artifacts</CardTitle>
              <CardDescription>
                {project.artifacts.length} artifact(s) created by agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.artifacts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No artifacts yet. Execute agents to generate artifacts.
                </p>
              ) : (
                <div className="space-y-4">
                  {project.artifacts.map((artifact, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{artifact.title || `Artifact ${idx + 1}`}</span>
                        <Badge variant="outline">{artifact.type || 'document'}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Created by: {artifact.agentName || 'unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

