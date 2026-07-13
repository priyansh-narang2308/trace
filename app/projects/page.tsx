"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import {
  CreateProjectForm,
  ProjectFormData,
} from "@/components/projects/create-project-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  FolderOpen,
  Users,
  Clock,
  Search,
  Globe,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProjectClient {
  projectId: string;
  name: string;
  description: string;
  isPublic: boolean;
  ownerAddress: string;
  createdAt: string;
  _count?: {
    checkpoints: number;
    collaborators: number;
  };
}

export default function ProjectsPage() {
  const { address, isConnected } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projects, setProjects] = useState<ProjectClient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchProjects = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/projects?ownerAddress=${address}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchProjects();
    }
  }, [isConnected, address, fetchProjects]);

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ownerAddress: address,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setProjects((prev) => [result.project, ...prev]);
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.projectId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Connect to TRACE</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-6">
            <p className="text-center text-muted-foreground text-sm leading-relaxed">
              Connect your Monad Testnet wallet to access your project dashboard, manage real-time cryptographic checkpoints, and collaborate with your team.
            </p>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background/98 to-muted/20 pb-16">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-md">
              T
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              TRACE
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Project Dashboard</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Deploy, track, and prove your development milestones on Monad Testnet
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} size="lg" className="shadow-md gap-2">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>

        {showCreateForm && (
          <div className="mb-10 animate-fade-in">
            <CreateProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, identifier, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Total Projects: `{filteredProjects.length}`
          </div>
        </div>

        {paginatedProjects.length === 0 ? (
          <Card className="border-dashed bg-card/40">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <FolderOpen className="h-16 w-16 text-muted-foreground/60 mb-4" />
              <h3 className="text-xl font-bold mb-2">No projects discovered</h3>
              <p className="text-muted-foreground text-center text-sm max-w-sm mb-6">
                Start your journey by anchoring your first hackathon or team project onto Monad Testnet.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedProjects.map((project) => (
                <Link key={project.projectId} href={`/projects/${project.projectId}`} className="group">
                  <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:border-primary/50 transition-all bg-card/80 backdrop-blur-xs">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {project.name}
                        </CardTitle>
                        <span className="shrink-0 p-1 rounded bg-muted/60 text-muted-foreground">
                          {project.isPublic ? (
                            <Globe className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground pt-1 truncate">
                        ID: `{project.projectId}`
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-between flex-1">
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-3 font-normal leading-relaxed">
                        {project.description}
                      </p>
                      <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-mono">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5" title="Collaborators">
                            <Users className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{project._count?.collaborators || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Checkpoints">
                            <Clock className="h-3.5 w-3.5 text-purple-400" />
                            <span>{project._count?.checkpoints || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t mt-8">
                <span className="text-xs font-mono text-muted-foreground">
                  Page `{currentPage}` of `{totalPages}`
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
