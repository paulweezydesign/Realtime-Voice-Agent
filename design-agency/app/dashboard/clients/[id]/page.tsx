'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Client {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  website?: string;
  industry?: string;
  status: string;
  leadScore: number;
  projects: string[];
  contactHistory: any[];
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch client details
      const clientResponse = await fetch(`/api/clients/${clientId}`);
      if (!clientResponse.ok) {
        throw new Error('Failed to fetch client details');
      }
      const clientData = await clientResponse.json();
      setClient(clientData.client);

      // Fetch client's projects
      const projectsResponse = await fetch(`/api/projects?clientId=${clientId}`);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    const newStatus = window.prompt(
      'Enter new status (lead, qualified, active, inactive):',
      client?.status
    );
    
    if (!newStatus) return;

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      alert('Status updated successfully!');
      fetchClientDetails();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleQualifyLead = async () => {
    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: 'client-acquisition',
          prompt: `Qualify this lead: ${client?.name} (${client?.email}) from ${client?.company || 'Unknown Company'}. Industry: ${client?.industry || 'Unknown'}`,
          clientId: clientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to qualify lead');
      }

      alert('Lead qualified! Check execution logs for results.');
      fetchClientDetails();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleGenerateProposal = async () => {
    const projectDescription = window.prompt('Enter project description for proposal:');
    if (!projectDescription) return;

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: 'client-acquisition',
          prompt: `Generate a proposal for ${client?.name} (${client?.company || 'Client'}). Project: ${projectDescription}`,
          clientId: clientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate proposal');
      }

      alert('Proposal generated! Check execution logs for results.');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-blue-500',
      qualified: 'bg-purple-500',
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </Button>
        <div className="mt-8 text-center">
          <p className="text-red-600 text-lg">{error || 'Client not found'}</p>
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
            <h1 className="text-4xl font-bold">{client.name}</h1>
            <p className="text-gray-600 mt-2">{client.email}</p>
            {client.company && (
              <p className="text-gray-500 mt-1">{client.company}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(client.status)}>
              {client.status}
            </Badge>
            <Button onClick={handleUpdateStatus} variant="outline" size="sm">
              Update Status
            </Button>
          </div>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lead Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{client.leadScore}/100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{client.industry || 'Not specified'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{projects.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Client Since</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Email:</span>{' '}
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>{' '}
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.website && (
                <div>
                  <span className="font-medium text-gray-600">Website:</span>{' '}
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {client.website}
                  </a>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Company:</span>{' '}
                {client.company || 'Not specified'}
              </div>
              <div>
                <span className="font-medium text-gray-600">Industry:</span>{' '}
                {client.industry || 'Not specified'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Client ID:</span> {client._id}
              </div>
              <div>
                <span className="font-medium">Status:</span> {client.status}
              </div>
              <div>
                <span className="font-medium">Lead Score:</span> {client.leadScore}/100
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(client.updatedAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Client Projects</CardTitle>
                  <CardDescription>
                    {projects.length} project(s) for this client
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/dashboard/projects/new')}>
                  + New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No projects yet. Create a project for this client.
                </p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-500">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{project.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Acquisition Actions</CardTitle>
              <CardDescription>
                Use AI agents to qualify leads and generate proposals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleQualifyLead}
                disabled={client.status !== 'lead'}
              >
                🎯 Qualify Lead
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleGenerateProposal}
              >
                📄 Generate Proposal
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  router.push(`/dashboard/projects/new?clientId=${clientId}`);
                }}
              >
                🚀 Create Project
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/workflows/execute', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        workflowName: 'client-onboarding',
                        triggerData: {
                          clientId: client._id,
                          clientName: client.name,
                          clientEmail: client.email,
                        },
                      }),
                    });

                    if (!response.ok) throw new Error('Failed to execute workflow');
                    alert('Client onboarding workflow started!');
                    fetchClientDetails();
                  } catch (err: any) {
                    alert(`Error: ${err.message}`);
                  }
                }}
              >
                🔄 Run Client Onboarding Workflow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

