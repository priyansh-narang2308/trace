/* eslint-disable react-hooks/set-state-in-effect */
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
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
  ShieldCheck,
  X,
} from "lucide-react";
import SideRays from "@/components/SideRays";

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create project");
      }

      const result = await response.json();
      setProjects((prev) => [result.project, ...prev]);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040506] text-[#ffffff] p-6 font-sans relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-screen">
          <SideRays
            className="w-full h-full"
            rayColor1="#FF2A2A"
            rayColor2="#FF6363"
            speed={2.2}
            intensity={1.8}
            origin="top-right"
          />
        </div>
        <Card className="w-full max-w-md bg-[#07080a] border border-[#363739] shadow-key relative z-10">
          <CardHeader className="pb-3 text-center border-b border-[#363739]">
            <CardTitle className="text-[22px] font-medium text-[#ffffff]">
              Connect to TRACE
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <p className="text-center text-[#9c9c9d] text-[14px] leading-[1.6]">
              Connect your Monad Testnet wallet to access your command
              dashboard, manage sub-second cryptographic checkpoints, and
              collaborate with your team.
            </p>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040506] text-[#ffffff] font-sans selection:bg-[#ff6363]/30 selection:text-white pb-20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-screen">
        <SideRays
          className="w-full h-full"
          rayColor1="#FF2A2A"
          rayColor2="#FF6363"
          speed={2.2}
          intensity={1.8}
          origin="top-right"
        />
      </div>
      <header className="sticky top-0 z-50 border-b border-[#363739] bg-[#040506]/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-5 w-5 rounded-xs bg-[#ff6363] rotate-45 shrink-0 flex items-center justify-center shadow-sm" />
            <span className="text-[16px] font-medium tracking-tight text-[#ffffff] font-sans">
              TRACE
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-[11px] sm:text-[12px] font-mono text-[#59d499] px-2 sm:px-2.5 py-1 rounded-full bg-[#1b1c1e] border border-[#363739] shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-[#59d499]" />
              <span>Monad Testnet</span>
            </span>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-10 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-[32px] sm:text-[36px] font-normal tracking-[0.2px] text-[#ffffff] leading-[1.15]">
              Project Command Center
            </h1>
            <p className="text-[#9c9c9d] mt-1 text-[15px]">
              Deploy, track, and anchor cryptographic hackathon milestones on
              Monad Testnet (`Chain ID 10143`)
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="cursor-pointer bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] px-5 h-10 rounded-lg shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>

        <Drawer open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DrawerContent className="bg-[#07080a] border-[#363739] text-[#ffffff] px-4">
            <div className="mx-auto w-full max-w-lg pb-6">
              <DrawerHeader className="px-0 pt-6">
                <DrawerTitle className="text-xl font-medium tracking-tight">Initialize New Project</DrawerTitle>
                <DrawerDescription className="text-[#9c9c9d] text-sm">
                  Create a secure, on-chain workspace to track your progress and milestones on Monad Testnet.
                </DrawerDescription>
              </DrawerHeader>
              <div className="mt-2">
                <CreateProjectForm
                  onSubmit={handleCreateProject}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9c9c9d]" />
            <Input
              placeholder="Search by name, identifier, or objectives..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-[#111214] border-[#363739] text-[#ffffff] text-[14px] focus:border-[#ff6363]"
            />
          </div>
          <div className="text-[12px] font-mono text-[#9c9c9d]">
            Total Anchors: `{filteredProjects.length}`
          </div>
        </div>

        {paginatedProjects.length === 0 ? (
          <Card className="bg-[#07080a] border border-dashed border-[#363739]">
            <CardContent className="flex flex-col items-center justify-center py-24">
              <FolderOpen className="h-14 w-14 text-[#9c9c9d]/40 mb-4" />
              <h3 className="text-[20px] font-medium text-[#ffffff] mb-2">
                No projects discovered
              </h3>
              <p className="text-[#9c9c9d] text-center text-[14px] max-w-md mb-6 leading-[1.6]">
                Start your building journey by anchoring your first hackathon
                entry or team project onto Monad Testnet.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="cursor-pointer bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] h-10 px-5 rounded-lg shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create First Project</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedProjects.map((project) => (
                <Link
                  key={project.projectId}
                  href={`/projects/${project.projectId}`}
                  className="group block h-full"
                >
                  <Card className="h-full flex flex-col justify-between bg-[#07080a] border border-[#363739] shadow-key hover:border-[#6a6b6c] transition-all">
                    <CardHeader className="pb-3 border-b border-[#363739]/50">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-[18px] font-medium text-[#ffffff] group-hover:text-[#ff6363] transition-colors line-clamp-1 font-sans">
                          {project.name}
                        </CardTitle>
                        <span className="shrink-0 p-1.5 rounded bg-[#1b1c1e] text-[#9c9c9d] border border-[#363739]">
                          {project.isPublic ? (
                            <Globe className="h-3.5 w-3.5 text-[#59d499]" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-[#ff6363]" />
                          )}
                        </span>
                      </div>
                      <div className="text-[12px] font-mono text-[#9c9c9d] pt-1 truncate">
                        ID: `{project.projectId}`
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-between flex-1 pt-4">
                      <p className="text-[14px] text-[#9c9c9d] mb-6 line-clamp-3 font-normal leading-[1.6]">
                        {project.description}
                      </p>
                      <div className="pt-3 border-t border-[#363739]/50 flex items-center justify-between text-[12px] text-[#9c9c9d] font-mono">
                        <div className="flex items-center gap-4">
                          <div
                            className="flex items-center gap-1.5"
                            title="Collaborators"
                          >
                            <Users className="h-3.5 w-3.5 text-[#63a1ff]" />
                            <span>{project._count?.collaborators || 0}</span>
                          </div>
                          <div
                            className="flex items-center gap-1.5"
                            title="Checkpoints"
                          >
                            <Clock className="h-3.5 w-3.5 text-[#ff6363]" />
                            <span>{project._count?.checkpoints || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[#ffffff] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t border-[#363739] mt-10">
                <span className="text-[12px] font-mono text-[#9c9c9d]">
                  Page `{currentPage}` of `{totalPages}`
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer bg-[#111214] hover:bg-[#1b1c1e] text-[#ffffff] border-[#363739] text-[12px] h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="cursor-pointer bg-[#111214] hover:bg-[#1b1c1e] text-[#ffffff] border-[#363739] text-[12px] h-8"
                  >
                    <span>Next</span>
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
