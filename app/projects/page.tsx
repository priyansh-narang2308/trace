'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { WalletConnect } from '@/components/wallet-connect'
import { CreateProjectForm, ProjectFormData } from '@/components/projects/create-project-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FolderOpen, Users, Clock } from 'lucide-react'

interface ProjectClient {
  projectId: string
  name: string
  description: string
  isPublic: boolean
  ownerAddress: string
  createdAt: string
  _count?: {
    checkpoints: number
    collaborators: number
  }
}

export default function ProjectsPage() {
  const { address, isConnected } = useAccount()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [projects, setProjects] = useState<ProjectClient[]>([])

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ownerAddress: address,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setProjects((prev) => [result.project, ...prev])
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const fetchProjects = async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/projects?ownerAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  // Fetch projects when wallet connects
  if (isConnected && projects.length === 0) {
    fetchProjects()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect to TRACE</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              Connect your wallet to access your projects and create new checkpoints on Monad.
            </p>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            TRACE
          </h1>
          <WalletConnect />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Your Projects</h2>
            <p className="text-muted-foreground mt-1">
              Manage your collaborative checkpointing projects
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <CreateProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first project to start collaborating with checkpoints on Monad
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.projectId} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project._count?.collaborators || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{project._count?.checkpoints || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
